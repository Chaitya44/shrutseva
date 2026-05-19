<?php

namespace App\Http\Controllers\Frontend;
use App\Helpers\BookHelper;
use App\Helpers\BhandarHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\Builder;
use Auth;
// use App\Models\Book;
use App\Models\BhandarData;
use App\Models\BookSize;
use App\Models\Language;
use App\Models\BookIssueHistory;
use Carbon\Carbon;

class DashboardController extends BaseController
{
    public function dashboard()
    { 
        $request = '';
        $bhandar_id = BhandarHelper::getBhandarId($request);
        //get
        $bhandar_dropdown = DB::table('backend_bhandar')->get();
        
        $booksizes = DB::table('backend_booksize')
            ->where('bhandar_id', $bhandar_id)
            ->get();
        
        $languages = DB::table('backend_language')
            ->where('bhandar_id', $bhandar_id)
            ->get();
        
        $booksizelist = BookHelper::getBookSizeTopNumbers($booksizes);
       // dd($booksizelist);
        $languagelist = BookHelper::getLanguageDisplayList($languages);
        $totalbooks = DB::table('BhandarData as book')
            ->join('backend_language as lang', 'lang.id', 'book.language_id')
            ->where('book.bhandar_code', $bhandar_id);   

        // Calculate statistics
        $stats = new BhandarData();
        $stats->totalSizes = $booksizes->count();
        $stats->totalBooks = $totalbooks->count();
        $stats->totalLanguages = $languages->count();
        $stats->totalIssuedBooks = BookIssueHistory::where('returned', null)->where('bhandar_id', $bhandar_id)->count();
        $timeThreshold = Carbon::now()->subHours(720);
        $stats->totalAddedInLastMonth = $totalbooks->where('book.created_date', '>', $timeThreshold)->count();
        // dd($stats);
        return view('frontend.dashboard', compact('booksizes', 'booksizelist', 'languages', 'languagelist', 'stats','bhandar_dropdown'));
    }

    public function apiDashboardStats(Request $request)
    {
        $bhandar_id = null;
        if ($request->has('bhandar')) {
            $parts = explode(' : ', $request->input('bhandar'));
            if (count($parts) === 2) {
                $bhandar = DB::table('backend_bhandar')
                    ->where('sname', trim($parts[0]))
                    ->where('city', trim($parts[1]))
                    ->first();
                if ($bhandar) {
                    $bhandar_id = $bhandar->bhandar_code;
                }
            } else {
                $bhandar = DB::table('backend_bhandar')
                    ->where('sname', trim($request->input('bhandar')))
                    ->orWhere('bhandar_code', trim($request->input('bhandar')))
                    ->first();
                if ($bhandar) {
                    $bhandar_id = $bhandar->bhandar_code;
                }
            }
        }

        if (!$bhandar_id) {
            $bhandar_id = BhandarHelper::getBhandarId($request);
        }

        if (!$bhandar_id) {
            $first = DB::table('backend_bhandar')->first();
            $bhandar_id = $first ? $first->bhandar_code : 'T01';
        }

        $booksizes = DB::table('backend_booksize')
            ->where('bhandar_id', $bhandar_id)
            ->get();
        
        $languages = DB::table('backend_language')
            ->where('bhandar_id', $bhandar_id)
            ->get();
        
        $booksizelist = BookHelper::getBookSizeTopNumbers($booksizes);
        $languagelist = BookHelper::getLanguageDisplayList($languages);

        $totalBooks = DB::table('BhandarData')
            ->where('bhandar_code', $bhandar_id)
            ->where('deleted_at', 0)
            ->count();

        $totalIssuedBooks = DB::table('backend_bookissuehistory')
            ->where('returned', null)
            ->where('bhandar_id', $bhandar_id)
            ->count();

        $timeThreshold = Carbon::now()->subDays(30);
        $totalAddedInLastMonth = DB::table('BhandarData')
            ->where('bhandar_code', $bhandar_id)
            ->where('deleted_at', 0)
            ->where('created_date', '>', $timeThreshold)
            ->count();

        // Map Size Chart data
        $sizeChart = [];
        $totalSizeBooksSum = 0;
        foreach ($booksizelist as $bs) {
            $val = $bs->booksize_total ?? 0;
            $totalSizeBooksSum += $val;
            $sizeChart[] = [
                'label' => $bs->size,
                'value' => $val,
                'percent' => 0
            ];
        }
        foreach ($sizeChart as &$sc) {
            if ($totalSizeBooksSum > 0) {
                $sc['percent'] = round(($sc['value'] / $totalSizeBooksSum) * 100);
            }
        }

        // Map Language Chart data
        $langChart = [];
        foreach ($languagelist as $lang) {
            $langChart[] = [
                'label' => $lang->language,
                'value' => $lang->count
            ];
        }

        // Map Table/Grid Data for details list
        $tableData = [];
        foreach ($booksizelist as $bs) {
            $tableData[] = [
                'size' => $bs->size,
                'lastNo' => $bs->top_number ?? '-',
                'date' => $bs->lastmodified ?? '-',
                'total' => $bs->booksize_total ?? 0,
                'progress' => ($totalBooks > 0) ? round((($bs->booksize_total ?? 0) / $totalBooks) * 100) : 0
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'totalBooks' => $totalBooks,
                    'totalIssuedBooks' => $totalIssuedBooks,
                    'totalAddedInLastMonth' => $totalAddedInLastMonth,
                    'totalSizes' => count($booksizes),
                    'totalLanguages' => count($languages)
                ],
                'sizeChart' => $sizeChart,
                'langChart' => $langChart,
                'tableData' => $tableData
            ]
        ]);
    }

    public function apiMasterDataList(Request $request)
    {
        $search = $request->input('search', '');
        $limit = $request->input('limit', 25);
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $limit;

        $query = DB::table('MasterData');

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('book_name', 'like', "%$search%")
                  ->orWhere('alternate_name', 'like', "%$search%")
                  ->orWhere('author', 'like', "%$search%")
                  ->orWhere('editor', 'like', "%$search%")
                  ->orWhere('publisher', 'like', "%$search%")
                  ->orWhere('subject', 'like', "%$search%")
                  ->orWhere('MasterID', 'like', "%$search%");
            });
        }

        $totalCount = $query->count();

        $records = $query->orderBy('SSID', 'desc')
            ->offset($offset)
            ->limit($limit)
            ->get();

        $formatted = [];
        foreach ($records as $r) {
            $formatted[] = [
                'id' => $r->MasterID ?? ('S' . $r->SSID),
                'ssid' => $r->SSID,
                'size' => $r->size ?? '',
                'name' => $r->book_name ?? '',
                'alt' => $r->alternate_name ?? '',
                'part' => $r->part ?? '',
                'kruti' => $r->Kruti ?? '',
                'author' => $r->author ?? '',
                'editor' => $r->editor ?? '',
                'lang' => $r->language ?? '',
                'page' => $r->page ?? '',
                'yearType' => $r->year_type ?? '',
                'year' => $r->year ?? '',
                'edition' => $r->edition ?? '',
                'publisher' => $r->publisher ?? '',
                'subject' => $r->subject ?? '',
                'particular' => $r->note ?? ''
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
            'total' => $totalCount,
            'page' => (int)$page,
            'limit' => (int)$limit
        ]);
    }
}
