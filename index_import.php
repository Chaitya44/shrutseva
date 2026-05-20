<?php


error_reporting(E_ALL);
ini_set('display_errors', 1);

// ===== TEMP DB IMPORT INTERCEPTOR - DELETE AFTER USE =====
if (isset($_GET['_import']) && $_GET['_import'] === 'shrut2026import') {
    header('Content-Type: application/json; charset=utf-8');
    @set_time_limit(300);
    @ini_set('memory_limit', '512M');

    $action  = $_GET['action'] ?? 'status';
    $sqlFile = __DIR__ . '/public/shrutseva_data_only.sql';

    // DB connection from .env
    $envFile = __DIR__ . '/.env';
    $env = [];
    if (file_exists($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
            list($k, $v) = explode('=', $line, 2);
            $env[trim($k)] = trim(trim($v), '"');
        }
    }

    $dbHost = $env['DB_HOST'] ?? '127.0.0.1';
    $dbName = $env['DB_DATABASE'] ?? 'shrutseva_test';
    $dbUser = $env['DB_USERNAME'] ?? 'root';
    $dbPass = $env['DB_PASSWORD'] ?? '';

    try {
        $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'DB connection failed: ' . $e->getMessage()]);
        exit;
    }

    $map = [
        'masterdata'               => 'MasterData',
        'backend_book'             => 'BhandarData',
        'backend_bhandar'          => 'backend_bhandar',
        'backend_member'           => 'backend_member',
        'backend_bookissuehistory' => 'backend_bookissuehistory',
    ];

    if ($action === 'status') {
        $exists = file_exists($sqlFile);
        $counts = [];
        foreach (array_values($map) as $tbl) {
            try { $counts[$tbl] = $pdo->query("SELECT COUNT(*) FROM `$tbl`")->fetchColumn(); }
            catch (Exception $e) { $counts[$tbl] = 'missing'; }
        }
        echo json_encode(['sql_found' => $exists, 'sql_size' => $exists ? round(filesize($sqlFile)/1024).'KB' : 'N/A', 'counts' => $counts]);
        exit;
    }

    if ($action === 'backup') {
        $r = [];
        foreach (array_values($map) as $tbl) {
            try {
                $bak = $tbl . '_bak';
                $pdo->exec("CREATE TABLE IF NOT EXISTS `$bak` LIKE `$tbl`");
                $pdo->exec("TRUNCATE TABLE `$bak`");
                $pdo->exec("INSERT INTO `$bak` SELECT * FROM `$tbl`");
                $r[$tbl] = $pdo->query("SELECT COUNT(*) FROM `$bak`")->fetchColumn() . ' rows';
            } catch (Exception $e) { $r[$tbl] = 'err: ' . $e->getMessage(); }
        }
        echo json_encode(['backup' => $r]);
        exit;
    }

    if ($action === 'import') {
        if (!file_exists($sqlFile)) { echo json_encode(['error' => 'SQL not found at ' . $sqlFile]); exit; }
        $offset = (int)($_GET['offset'] ?? 0);
        $chunk  = 60;
        $all    = array_values(array_filter(
            file($sqlFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES),
            function($l) { return stripos(ltrim($l), 'INSERT INTO') === 0; }
        ));
        $total = count($all);
        $slice = array_slice($all, $offset, $chunk);
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        $done = 0; $errs = [];
        foreach ($slice as $sql) {
            foreach ($map as $from => $to) {
                $sql = preg_replace('/INSERT INTO `' . preg_quote($from, '/') . '`/i', 'INSERT IGNORE INTO `' . $to . '`', $sql);
            }
            try { $pdo->exec($sql); $done++; }
            catch (Exception $e) { $errs[] = substr($e->getMessage(), 0, 80); }
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        $next = $offset + $chunk;
        echo json_encode(['total' => $total, 'offset' => $offset, 'next' => $next, 'done' => $done, 'errors' => count($errs), 'pct' => min(round($next/$total*100),100), 'finished' => ($next >= $total)]);
        exit;
    }

    if ($action === 'verify') {
        $r = [];
        foreach (array_values($map) as $tbl) {
            try {
                $cur = $pdo->query("SELECT COUNT(*) FROM `$tbl`")->fetchColumn();
                try { $bak = $pdo->query("SELECT COUNT(*) FROM `{$tbl}_bak`")->fetchColumn(); } catch (Exception $e) { $bak = 0; }
                $r[$tbl] = ['after' => (int)$cur, 'before' => (int)$bak, 'added' => $cur - $bak];
            } catch (Exception $e) { $r[$tbl] = 'err'; }
        }
        echo json_encode(['verify' => $r]);
        exit;
    }

    echo json_encode(['error' => 'Unknown action']);
    exit;
}
// ===== END TEMP IMPORT =====

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

require __DIR__.'/vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
