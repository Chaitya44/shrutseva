<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$kernel->bootstrap();

header('Content-Type: text/plain');

try {
    $langs = Illuminate\Support\Facades\DB::table('MasterData')
        ->distinct()
        ->pluck('language')
        ->toArray();
    echo "Distinct languages:\n";
    print_r($langs);
    
    $sample = Illuminate\Support\Facades\DB::table('MasterData')
        ->select('SSID', 'book_name', 'language')
        ->limit(10)
        ->get();
    echo "\nSample books:\n";
    print_r($sample);
} catch (\Exception $e) {
    echo $e->getMessage();
}
