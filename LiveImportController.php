<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LiveImportController extends Controller
{
    // Table name mapping: live dump names -> Laravel/test names
    private $tableMap = [
        'masterdata'               => 'MasterData',
        'backend_book'             => 'BhandarData',
        'backend_bhandar'          => 'backend_bhandar',
        'backend_member'           => 'backend_member',
        'backend_bookissuehistory' => 'backend_bookissuehistory',
    ];

    public function run(Request $request)
    {
        // Secret key check
        if ($request->get('key') !== 'shrut2026import') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $action  = $request->get('action', 'status');
        $sqlFile = public_path('shrutseva_data_only.sql');

        if ($action === 'status') {
            $exists = file_exists($sqlFile);
            $counts = [];
            foreach (array_values($this->tableMap) as $tbl) {
                try {
                    $counts[$tbl] = DB::table($tbl)->count();
                } catch (\Exception $e) {
                    $counts[$tbl] = 'missing';
                }
            }
            return response()->json([
                'sql_file_found' => $exists,
                'sql_file_size'  => $exists ? round(filesize($sqlFile) / 1024) . ' KB' : 'N/A',
                'sql_file_path'  => $sqlFile,
                'current_counts' => $counts,
            ]);
        }

        if ($action === 'backup') {
            $results = [];
            foreach (array_values($this->tableMap) as $tbl) {
                try {
                    $bak = $tbl . '_bak';
                    DB::statement("CREATE TABLE IF NOT EXISTS `{$bak}` LIKE `{$tbl}`");
                    DB::statement("TRUNCATE TABLE `{$bak}`");
                    DB::statement("INSERT INTO `{$bak}` SELECT * FROM `{$tbl}`");
                    $results[$tbl] = DB::table($bak)->count() . ' rows backed up';
                } catch (\Exception $e) {
                    $results[$tbl] = 'error: ' . $e->getMessage();
                }
            }
            return response()->json(['backup' => $results]);
        }

        if ($action === 'import') {
            if (!file_exists($sqlFile)) {
                return response()->json(['error' => 'SQL file not found at: ' . $sqlFile], 404);
            }

            $offset    = (int) $request->get('offset', 0);
            $chunkSize = 60;

            // Read all INSERT lines
            $allLines = file($sqlFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $inserts  = array_values(array_filter($allLines, function ($line) {
                return stripos(ltrim($line), 'INSERT INTO') === 0;
            }));
            $total = count($inserts);
            $slice = array_slice($inserts, $offset, $chunkSize);

            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            $done   = 0;
            $errors = [];

            foreach ($slice as $sql) {
                // Remap table names
                foreach ($this->tableMap as $from => $to) {
                    $sql = preg_replace(
                        '/INSERT INTO `' . preg_quote($from, '/') . '`/i',
                        'INSERT IGNORE INTO `' . $to . '`',
                        $sql
                    );
                }
                try {
                    DB::statement($sql);
                    $done++;
                } catch (\Exception $e) {
                    $errors[] = substr($e->getMessage(), 0, 100);
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            $next     = $offset + $chunkSize;
            $finished = $next >= $total;
            $pct      = $total > 0 ? min(round($next / $total * 100), 100) : 100;

            return response()->json([
                'total'    => $total,
                'offset'   => $offset,
                'next'     => $next,
                'done'     => $done,
                'errors'   => count($errors),
                'pct'      => $pct,
                'finished' => $finished,
            ]);
        }

        if ($action === 'verify') {
            $result = [];
            foreach (array_values($this->tableMap) as $tbl) {
                try {
                    $cur = DB::table($tbl)->count();
                    try {
                        $bak = DB::table($tbl . '_bak')->count();
                    } catch (\Exception $e) {
                        $bak = 0;
                    }
                    $result[$tbl] = [
                        'after'  => $cur,
                        'before' => $bak,
                        'added'  => $cur - $bak,
                    ];
                } catch (\Exception $e) {
                    $result[$tbl] = 'error: ' . $e->getMessage();
                }
            }
            return response()->json(['verify' => $result]);
        }

        return response()->json(['error' => 'Unknown action. Use: status, backup, import, verify']);
    }
}
