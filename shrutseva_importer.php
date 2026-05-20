<?php
/**
 * ShrutSeva Live DB Importer
 * Upload via FTP → run once in browser → DELETE immediately after
 */

define('SECRET',    'shrut2026import');
define('SQL_FILE',  __DIR__ . '/shrutseva_data_only.sql');
define('DB_HOST',   '127.0.0.1');
define('DB_NAME',   'shrutseva_test');
define('DB_USER',   'shrutseva_test');
define('DB_PASS',   'PcrM5SHw8fM77aCN');
define('CHUNK',      60);

if (($_GET['key'] ?? '') !== SECRET) { http_response_code(403); die('403 Forbidden'); }
$action = $_GET['action'] ?? 'status';
@set_time_limit(300); @ini_set('memory_limit','512M');

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
} catch(Exception $e){ die('<p style="color:red;font:14px monospace;padding:20px"><b>DB Error:</b> '.htmlspecialchars($e->getMessage()).'<br><br>Update DB_USER and DB_PASS in this file.</p>'); }

// Table name map: live dump name → Laravel/test name
$map = [
    'masterdata'               => 'MasterData',
    'backend_book'             => 'BhandarData',
    'backend_bhandar'          => 'backend_bhandar',
    'backend_member'           => 'backend_member',
    'backend_bookissuehistory' => 'backend_bookissuehistory',
];

$css = '<style>
*{box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:16px}
.c{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;max-width:760px;margin:16px auto}
h1{color:#58a6ff;margin-top:0}h2{color:#79c0ff}
.ok{color:#3fb950}.err{color:#f85149}.warn{color:#d29922}
.btn{display:inline-block;padding:9px 18px;border-radius:8px;color:#fff;text-decoration:none;font-weight:700;margin:4px;font-size:13px}
.bg{background:#238636}.bb{background:#1f6feb}.br{background:#da3633}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}
th,td{padding:7px 10px;border-bottom:1px solid #30363d;text-align:left}th{color:#79c0ff}
code{background:#21262d;padding:2px 5px;border-radius:4px;font-size:12px}
.bar{background:#21262d;border-radius:6px;height:10px;margin:8px 0}
.fill{background:#3fb950;border-radius:6px;height:10px;transition:width .3s}
pre{background:#21262d;padding:10px;border-radius:6px;overflow-x:auto;font-size:11px;max-height:200px}
</style>';

// ── STATUS ───────────────────────────────────────────────────
if ($action === 'status') {
    $exists = file_exists(SQL_FILE);
    $size   = $exists ? round(filesize(SQL_FILE)/1024,0).' KB' : '—';
    $lines  = 0;
    if ($exists) { $f=new SplFileObject(SQL_FILE); $f->seek(PHP_INT_MAX); $lines=$f->key(); }
    echo $css.'<div class="c"><h1>🗄️ ShrutSeva DB Importer</h1>';
    echo '<p class="warn">⚠️ Delete this file + the SQL file via FTP after import!</p>';
    echo '<h2>SQL File</h2><table>';
    echo '<tr><th>File</th><td><code>shrutseva_data_only.sql</code></td></tr>';
    echo '<tr><th>Present</th><td class="'.($exists?'ok':'err').'">'.($exists?"✅ Yes ($size)":'❌ Not found — upload it via FTP next to this file').'</td></tr>';
    echo '<tr><th>INSERT batches</th><td>'.number_format($lines).'</td></tr></table>';
    echo '<h2>Current DB Row Counts</h2><table><tr><th>Table</th><th>Rows now</th></tr>';
    foreach ($map as $from=>$to) {
        try { $n=$pdo->query("SELECT COUNT(*) FROM `$to`")->fetchColumn(); echo "<tr><td><code>$to</code></td><td>".number_format($n)."</td></tr>"; }
        catch(Exception $e){ echo "<tr><td><code>$to</code></td><td class='err'>Table missing</td></tr>"; }
    }
    echo '</table>';
    if ($exists) {
        echo '<h2>Run in order:</h2>';
        echo '<a class="btn bb" href="?key='.SECRET.'&action=backup">1️⃣ Backup Tables</a>';
        echo '<a class="btn bg" href="?key='.SECRET.'&action=import">2️⃣ Import Data</a>';
        echo '<a class="btn br" href="?key='.SECRET.'&action=verify">3️⃣ Verify</a>';
    }
    echo '</div>';
}

// ── BACKUP ───────────────────────────────────────────────────
if ($action === 'backup') {
    echo $css.'<div class="c"><h1>💾 Backing Up Tables</h1>';
    foreach (array_values($map) as $tbl) {
        try {
            $bak = $tbl.'_bak';
            $pdo->exec("CREATE TABLE IF NOT EXISTS `$bak` LIKE `$tbl`");
            $pdo->exec("TRUNCATE TABLE `$bak`");
            $pdo->exec("INSERT INTO `$bak` SELECT * FROM `$tbl`");
            $n=$pdo->query("SELECT COUNT(*) FROM `$bak`")->fetchColumn();
            echo "<p class='ok'>✅ $tbl → $bak (".number_format($n)." rows)</p>";
        } catch(Exception $e){ echo "<p class='err'>❌ $tbl: ".htmlspecialchars($e->getMessage())."</p>"; }
    }
    echo '<br><a class="btn bg" href="?key='.SECRET.'&action=import">▶ Next: Import</a></div>';
}

// ── IMPORT ───────────────────────────────────────────────────
if ($action === 'import') {
    if (!file_exists(SQL_FILE)) { echo $css.'<div class="c"><p class="err">SQL file not found.</p></div>'; exit; }
    $offset = (int)($_GET['offset'] ?? 0);

    $all = array_values(array_filter(
        file(SQL_FILE, FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES),
        fn($l)=>stripos(ltrim($l),'INSERT INTO')===0
    ));
    $total = count($all);
    $chunk = array_slice($all, $offset, CHUNK);

    $pdo->exec("SET FOREIGN_KEY_CHECKS=0"); $pdo->exec("SET NAMES utf8mb4");
    $done=0; $errs=[];
    foreach ($chunk as $sql) {
        foreach ($map as $from=>$to)
            $sql = preg_replace('/INSERT INTO `'.preg_quote($from,'/').'`/i','INSERT IGNORE INTO `'.$to.'`',$sql);
        try { $pdo->exec($sql); $done++; }
        catch(Exception $e){ $errs[]=substr($e->getMessage(),0,100); }
    }
    $pdo->exec("SET FOREIGN_KEY_CHECKS=1");

    $next = $offset + CHUNK;
    $pct  = $total>0 ? min(round($next/$total*100),100) : 100;
    $done2= min($next,$total);

    echo $css.'<div class="c"><h1>⏳ Importing…</h1>';
    echo '<div class="bar"><div class="fill" style="width:'.$pct.'%"></div></div>';
    echo "<p><b>$pct%</b> — batch $offset→".($next-1)." of $total</p>";
    echo "<p class='ok'>✅ $done lines this batch</p>";
    if ($errs) echo "<p class='warn'>⚠️ ".count($errs)." skipped</p><pre>".htmlspecialchars(implode("\n",array_slice($errs,0,3)))."</pre>";

    if ($next < $total) {
        $url='?key='.SECRET.'&action=import&offset='.$next;
        echo '<script>setTimeout(()=>location.href="'.$url.'",600)</script>';
        echo '<a class="btn bb" href="'.$url.'">▶ Continue</a>';
    } else {
        echo '<p class="ok" style="font-size:20px">🎉 <b>Import Complete!</b></p>';
        echo '<a class="btn br" href="?key='.SECRET.'&action=verify">✅ Verify</a>';
    }
    echo '</div>';
}

// ── VERIFY ───────────────────────────────────────────────────
if ($action === 'verify') {
    echo $css.'<div class="c"><h1>✅ Verification</h1>';
    echo '<table><tr><th>Table</th><th>After import</th><th>Backup (before)</th><th>New rows added</th></tr>';
    foreach (array_values($map) as $tbl) {
        try {
            $cur=$pdo->query("SELECT COUNT(*) FROM `$tbl`")->fetchColumn();
            try{ $bak=$pdo->query("SELECT COUNT(*) FROM `{$tbl}_bak`")->fetchColumn(); } catch(Exception $e){ $bak=0; }
            $diff=$cur-$bak; $cls=$diff>0?'ok':($diff<0?'err':'');
            echo "<tr><td><code>$tbl</code></td><td>".number_format($cur)."</td><td>".number_format($bak)."</td><td class='$cls'>".($diff>=0?'+':'').$diff."</td></tr>";
        } catch(Exception $e){ echo "<tr><td><code>$tbl</code></td><td colspan=3 class='err'>".htmlspecialchars($e->getMessage())."</td></tr>"; }
    }
    echo '</table>';
    echo '<div class="warn" style="margin-top:16px;padding:12px;background:#1a1200;border-radius:8px">';
    echo '<b>⚠️ IMPORTANT — Now delete via FTP:</b><ul>';
    echo '<li><code>shrutseva_importer.php</code></li>';
    echo '<li><code>shrutseva_data_only.sql</code></li>';
    echo '</ul>Then test your site — publisher/author data should now appear.</div></div>';
}
