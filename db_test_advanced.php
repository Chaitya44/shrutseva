<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$kernel->bootstrap();

header('Content-Type: text/plain');

echo "--- Advanced Search Diagnosis ---\n";

$titleTerm = "ભક્તામર";
$langVal = "Gujarati";

$baseQuery = DB::table('MasterData as master');

// Simulate the language filter
if ($langVal === 'Gujarati') {
    $baseQuery->where(function($q) {
        $q->where('master.language', 'like', '%G%')
          ->orWhere('master.language', 'like', '%ગુ%');
    });
}

// Check how many books have Gujarati language
$countLang = (clone $baseQuery)->count();
echo "Total books with language 'Gujarati' (G or ગુ): $countLang\n";

// Let's find any book with title containing 'ભક્તામર' without any other filter
$directFind = DB::table('MasterData as master')->where('master.book_name', 'like', '%ભક્તામર%')->get();
echo "Direct search for book_name LIKE '%ભક્તામર%': " . count($directFind) . " matches.\n";
foreach ($directFind as $b) {
    echo "  - SSID: {$b->SSID}, Name: {$b->book_name}, Lang: {$b->language}, ismap: {$b->ismap}\n";
}

// Let's check normalizeToCommon behavior
$trait = new class {
    use \App\Traits\NormalizesSearchTerm;
};
$normInput = $trait->normalizeToCommon($titleTerm);
echo "Normalized input 'ભક્તામર': '$normInput'\n";

// Check the _common values in the database for directFind matches
foreach ($directFind as $b) {
    echo "  - SSID: {$b->SSID}, Name Common: {$b->book_name_common}, Name Hindi Common: {$b->book_name_hindi_common}\n";
}

// Let's run the exact query logic we have in our controller
$queryList = (clone $baseQuery);
$gujTitleTerm = $trait->devanagariToGujarati($titleTerm);
$devTitleTerm = $trait->gujaratiToDevanagari($titleTerm);

$applySearch = function ($query, $term, array $commonColumns) use ($trait) {
    $searchTerm = trim((string) $term);
    if ($searchTerm === '') {
        return;
    }
    $terms = array_values(array_filter(preg_split('/\s+/', $searchTerm)));
    $whereRawParams = [];
    $colConditions = [];
    foreach ($commonColumns as $col) {
        $perWord = [];
        foreach ($terms as $t) {
            $normalized     = $trait->normalizeToCommon($t);
            $normalizedNoSp = preg_replace('/\s+/', '', $normalized);
            $perWord[] = "($col LIKE ? OR REPLACE($col, ' ', '') LIKE ?)";
            $whereRawParams[] = '%' . $normalized . '%';
            $whereRawParams[] = '%' . $normalizedNoSp . '%';
        }
        $colConditions[] = '(' . implode(' AND ', $perWord) . ')';
    }
    $query->whereRaw('(' . implode(' OR ', $colConditions) . ')', $whereRawParams);
};

$queryList->where(function ($q) use ($applySearch, $titleTerm, $gujTitleTerm, $devTitleTerm) {
    $q->where(function ($sq) use ($applySearch, $titleTerm) {
        $applySearch($sq, $titleTerm, [
            'master.book_name_common',
            'master.alternate_name_common',
            'master.Kruti_common',
        ]);
    })->orWhere(function ($sq) use ($applySearch, $gujTitleTerm) {
        $applySearch($sq, $gujTitleTerm, [
            'master.book_name_common',
            'master.alternate_name_common',
            'master.Kruti_common',
        ]);
    })->orWhere(function ($sq) use ($applySearch, $devTitleTerm) {
        $applySearch($sq, $devTitleTerm, [
            'master.book_name_hindi_common',
            'master.alternate_name_hindi_common',
            'master.Kruti_hindi_common',
        ]);
    });
});

\DB::enableQueryLog();
$results = $queryList->get();
$log = \DB::getQueryLog();

echo "Exact query count: " . count($results) . "\n";
echo "Executed SQL:\n";
print_r($log);
