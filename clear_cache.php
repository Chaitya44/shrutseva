<?php
define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$kernel->bootstrap();

header('Content-Type: text/plain');

$artisan = $app->make('Illuminate\Contracts\Console\Kernel');

echo "Clearing route cache...\n";
$artisan->call('route:clear');
echo $artisan->output() . "\n";

echo "Clearing config cache...\n";
$artisan->call('config:clear');
echo $artisan->output() . "\n";

echo "Clearing cache...\n";
$artisan->call('cache:clear');
echo $artisan->output() . "\n";

if (function_exists('opcache_reset')) {
    echo "Resetting OPCache...\n";
    if (opcache_reset()) {
        echo "OPCache reset successfully!\n";
    } else {
        echo "OPCache reset failed!\n";
    }
} else {
    echo "OPCache extension is not loaded.\n";
}

echo "Done!\n";
