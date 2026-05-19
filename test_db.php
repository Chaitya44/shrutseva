<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$kernel->bootstrap();

header('Content-Type: text/plain');

try {
    $languagesMaster = DB::table('MasterData')->distinct()->pluck('language')->toArray();
    echo "Distinct language values in MasterData:\n";
    print_r($languagesMaster);

    $languagesBhandar = DB::table('BhandarData')->distinct()->pluck('language')->toArray();
    echo "Distinct language values in BhandarData:\n";
    print_r($languagesBhandar);
    
    $sample = DB::table('MasterData')
        ->select('SSID', 'book_name', 'language')
        ->whereNotNull('language')
        ->where('language', '!=', '')
        ->limit(10)
        ->get()
        ->toArray();
    echo "\nSample records from MasterData:\n";
    print_r($sample);
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
