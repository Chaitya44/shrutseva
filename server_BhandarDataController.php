<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Drivers\Gd\Driver;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Query\Builder;
use PhpOffice\PhpSpreadsheet\Writer;
use App\Http\Controllers\Controller;
use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Jobs\ExportDataJob;
use App\Helpers\BookHelper;
use App\Models\BhandarData;
use App\Models\MasterData;
use App\Models\Bhandars;
use App\Models\Language;
use App\Models\BookSize;
use DateTime;
use DB;
use Carbon\Carbon;

class BhandarDataController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth');
    }


    /*******************bhandar list code*************/
    public function bhandar_datalist(Request $request)
    {
        $userId = Auth::id(); // Get the logged-in user's ID
        $allowedBhandarCodes = DB::table('backend_adminuser_bhandars')
            ->where('adminuser_id', $userId)
            ->pluck('bhandar_id')
            ->toArray();

        $bhandarCode = DB::table('backend_bhandar');
        if (Auth::user()->user_type != "admin") {
            $bhandarCode->whereIn('bhandar_code', $allowedBhandarCodes);
        }
        // Check if date range filter is applied
        if ($request->filled('date_from') && $request->filled('date_to')) {
        $bhandarCode->whereBetween('created', [$request->date_from, $request->date_to]);
        }
        $bhandarCode = $bhandarCode->get(['bhandar_code', 'sname', 'city']);

        $languages = DB::table('backend_language')->get('id', 'name');
        $book_size = DB::table('backend_booksize')->where('id', 'size');
        $Byear = DB::table('BhandarData')->whereNotNull('year')->where('year', '!=', '')->distinct()->orderBy('year', 'DESC')->get(['year', 'year_type']);
        $Myear = DB::table('MasterData')->whereNotNull('year')->where('year', '!=', '')->distinct()->orderBy('year', 'DESC')->get(['year', 'year_type']);

        $columns = [
            'MasterId' => 'MasterId',
            'bhandar_code' => 'bhandarCode',
            'book_name' => 'Name',
            'author' => 'Author',
            'editor' => 'Editor',
            'language' => 'Language',
            'publisher' => 'Publisher',
            'note' => 'Note',
        ];
        return view('backend.BhandarData.list', compact('columns', 'bhandarCode', 'languages', 'book_size', 'Byear', 'Myear'));
    }

    public function get_bhandar_data_list(Request $request)
    {
        $draw = $request->input('draw', '');
        $start = $request->input('start', 0);
        $length = $request->input('length', 10);
       // dd($request);

        /* initially set column as MasterID which value is null */
        $column = $request->input('column', 'MasterID');
        $DataSearch = $request->input('searchtext', '');

        if (isset($_GET['draw'])) {
            $draw = $_GET['draw'];
        }

        if (isset($_GET['start'])) {
            $start = $_GET['start'];
        }

        if (isset($_GET['length'])) {
            $length = $_GET['length'];
        }

        if ($request->column) {
            $column = $request->column;
        }
        if ($request->searchtext) {
            $DataSearch = $request->searchtext;
        }

        // to avoid undefined index errors
        $columnIndex = 0;
        $sortDirection = 'asc';

        if (isset($_GET['order'][0]['column'], $_GET['order'][0]['dir'])) {
            $columnIndex = $_GET['order'][0]['column'];
            $sortDirection = $_GET['order'][0]['dir'];
        }

        // $columnIndex = $_GET['order'][0]['column'];  
        // $sortDirection = $_GET['order'][0]['dir'];  
        $columns = [
            1 => 'BhandarData.masterID', 
            2 => 'BhandarData.Bhandar_code', 
            3 => 'BhandarData.book_name', 
            4 => 'BhandarData.alternate_name', 
            5 => 'BhandarData.Kruti', 
            6 => 'BhandarData.book_number', 
            7 => 'BhandarData.part', 
            8 => 'BhandarData.author', 
            9 => 'BhandarData.editor', 
            10 => 'BhandarData.language', 
            11 => 'BhandarData.page', 
            12 => 'BhandarData.edition', 
            13 => 'BhandarData.publisher', 
            14 => 'BhandarData.note', 
            15 => 'BhandarData.bhandar_note', 
            16 => 'BhandarData.createdBy', 
            17 => 'BhandarData.created_date', 
        ];

        $userId = Auth::id();
        // dd($userId);
        $isAdmin = Auth::user()->is_superuser;

        $queryCount = DB::table('BhandarData')
            ->join('backend_bhandar', 'BhandarData.bhandar_code', '=', 'backend_bhandar.bhandar_code')
            // ->join('MasterData', 'BhandarData.MasterID', '=', 'MasterData.MasterID')
            ->where("BhandarData.$column", 'LIKE', $DataSearch . '%')
            ->where('BhandarData.MasterId', '!=', Null)
            ->where('deleted_at', 0)
            ->when(
                $column == 'book_name',
                function (Builder $builder) use ($DataSearch) {
                    $builder->orWhere('BhandarData.alternate_name', $DataSearch);
                }
            )
            ->when(
                $request->date_from && $request->date_to,
                function (Builder $builder) use ($request) {
                    $builder->whereBetween('BhandarData.created_date', [
                        $request->date_from, 
                        Carbon::parse($request->date_to)->endOfDay()->toDateTimeString(),

                    ]);
                }
            ) 
            ->when(
                $request->book_number,
                function (Builder $builder) use ($request) {
                    $builder->where('BhandarData.book_number', $request->book_number);
                }
            )
            ->select("*", /* "MasterData.source" */);

        $queryList = DB::table('BhandarData')
            ->join('backend_bhandar', 'BhandarData.bhandar_code', '=', 'backend_bhandar.bhandar_code') // Add join to fetch sname and city
            // ->join('MasterData', 'BhandarData.MasterID', '=', 'MasterData.MasterID')
            ->Where("BhandarData.$column", 'LIKE', $DataSearch . '%')
            ->where('BhandarData.MasterId', '!=', Null)
            ->where('deleted_at', 0)
            ->when(
                $column == 'book_name',
                function (Builder $builder) use ($DataSearch) {
                    $builder->orWhere('BhandarData.alternate_name', $DataSearch);
                }
            )
            ->when(
                $request->date_from && $request->date_to,
                function (Builder $builder) use ($request) {
                    $builder->whereBetween('BhandarData.created_date', [
                        $request->date_from, 
                        Carbon::parse($request->date_to)->endOfDay()->toDateTimeString(),

                    ]);
                }
            )
            ->when(
                $request->book_number,
                function (Builder $builder) use ($request) {
                    $builder->where('BhandarData.book_number', $request->book_number);
                }
            )
            ->select("*", /* "MasterData.source" */)->offset($start)->limit($length);       
            
            
        if (isset($columns[$columnIndex])) {

            $orderByColumn = $columns[$columnIndex];  
            // dd($orderByColumn);
            if($orderByColumn == 'book_number'){
                $queryList->orderBy('size', $sortDirection)
                    ->orderBy('no', $sortDirection);
            }
            else{
                $queryList->orderBy($orderByColumn, $sortDirection);
            }
        }else{
            $queryList->orderBy('BhandarData.MasterID', 'ASC');
        }

        if (!$isAdmin) {
            $queryCount->join('backend_adminuser_bhandars', 'BhandarData.bhandar_code', '=', 'backend_adminuser_bhandars.bhandar_id')
                ->where('backend_adminuser_bhandars.adminuser_id', $userId);

            $queryList->join('backend_adminuser_bhandars', 'BhandarData.bhandar_code', '=', 'backend_adminuser_bhandars.bhandar_id')
                ->where('backend_adminuser_bhandars.adminuser_id', $userId);
        }

        $totalRecored = $queryCount->count();
        $bhandarDataList = $queryList->get();        
        // Get all unique user_ids from the collection
        $userIds = $bhandarDataList->pluck('user_id')->filter()->unique()->toArray();       
        // Retrieve all users corresponding to the unique IDs in a single query
        $users = DB::table('users')->whereIn('id', $userIds)->get()->keyBy('id');  // Use keyBy to index by user ID
        
        /* combine child and parent records */
        $combinedData = [];
        foreach ($bhandarDataList as $parent) {
            $combinedData[] = $parent;
            $child = DB::table('kruti')->where('parent_id', $parent->MasterDataSSID)->get();
            $child = $child->map(function ($item) {
                $item->bhandar_code = '';
                $item->bhandar_note = '';
                return $item;
            });
            // echo "<pre>";print_r($parent);echo "</pre>";
            // echo "<pre>";print_r($child);echo "</pre>";
            $count = count($child);
            if ($count > 0) {
                for ($i = 0; $i < $count; $i++) {
                    $combinedData[] = $child[$i];
                }
            }
        }
        // Format dates in combinedData
        $combinedData = collect($combinedData)->map(function ($data) use ($users){
            // If the user_id exists and a matching user is found, replace it with the username
            if (isset($data->user_id) && isset($users[$data->user_id])) {
                $user = $users[$data->user_id];
                $data->createdBy = ($user && $user->name && $user->last_name) ? $user->name . ' ' . $user->last_name : '';  
            } else {
                    $data->createdBy = ''; 
            }
            if (isset($data->created_date)) {
                $data->created_date = Carbon::parse($data->created_date)->format('d-m-Y H:i:s');
            }
            return $data;
        });
        return response()->Json([
            'draw' => $draw,
            'recordsTotal' => $totalRecored,
            'recordsFiltered' => $totalRecored,
            'data' => $combinedData,
        ]);
    }

    public function edit_bhandarData(Request $request)
    {
        $bhandarCode = DB::table('backend_bhandar')->get(['bhandar_code']);
        $bhandarData = DB::table('BhandarData')->select("*")->where('SSID', $request->ssid)->first();
       // DD($bhandarData);
        $language_master = DB::table('languages_master')->get(['id','name']);
        $year = DB::table('BhandarData')
            ->whereNotNull('year')
            ->where('year', '!=', '')
            ->distinct()
            ->orderBy('year', 'DESC')
            ->get('year');

        if ($bhandarData) {
            return view('backend.BhandarData.edit_bhandar_data', compact('bhandarData', 'year', 'bhandarCode','language_master'));
        } else {
            return redirect()->route('admin.dashboard')->with('warning', 'Bhandar data with SSID "' . $request->ssid . '" doesn’t exist. Perhaps it was deleted?');
        }
    }

    public function update_bhandarData(Request $request)
    {
        
        $request->validate([
            'book_name' => 'required|max:2048',
            'bhandar_code' => 'required|max:2048',
            'language' => 'required|string|max:255',
            'size' => 'required|string|max:255',
        ]);
        
        $userId = Auth::user()->id;

        try {
            $existingData = DB::table('BhandarData')->where('SSID', $request->ssid)->first();

            // dd('JSID', $existingData->JSID);
            
            // if (!empty($existingData->JSID)) {
            //     return redirect()->back()->with('warning', "You cannot edit/update JSID $existingData->JSID.");
            // }

            /* Cover Image */
            $coverImageName = '';
            if ($request->hasFile('cover')) {

                $image = $request->file('cover');
                $filename = $image->getClientOriginalName();
                $path = public_path('/uploads');

                // Create a thumbnail
                $manager = new ImageManager(new Driver());
                $thumbnailimage = $manager->read($image);
                $thumbnailimage->scale(width: 450);

                // save modified image in new format 
                $thumbnailPath = public_path('/uploads/thumbnails');
                $thumbnailName = 'thumbnail_' . time() . '_' . $image->getClientOriginalName();
                $thumbnailimage->toPng()->save($thumbnailPath . '/' . $thumbnailName, 60);

                $image->move($path, $filename);
                $coverImageName = $thumbnailPath;
            }

            /* PDF */
            $pdfName = '';
            if ($request->hasFile('pdf')) {
                $file = $request->file('pdf');
                $pdfName = time() . '_' . $file->getClientOriginalName();
                $path = public_path('/pdfs');
                $file->move($path, $pdfName);
            }

            $logData = [
                'JSID' => $existingData->JSID,
                'book_name' => $request->book_name ?? $existingData->book_name,
                'bhandar_code' => $request->bhandar_code,
                'alternate_name' => $request->alternate_name ?? $existingData->alternate_name,
                'book_number' => $existingData->book_number,
                'part' => $request->part ?? $existingData->part,
                'publisher' => $request->publisher ?? $existingData->publisher,
                'Kruti' => $request->Kruti ?? $existingData->Kruti,
                'author' => $request->author ?? $existingData->author,
                'editor' => $request->editor ?? $existingData->editor,
                'language' => $request->language ?? $existingData->language,
                'page' => $request->page ?? $existingData->page,
                'year_type' => $request->year_type,
                'year' => $request->year,
                'edition' => $request->edition,
                'size' => $request->size ?? $existingData->size,
                'subject' => $request->subject ?? $existingData->subject,
                'cover' => $coverImageName,
                'pdf' => $pdfName,
                'created_date' => now(),
                'modifiedDate' => now(),
                'MasterID' => $existingData->MasterID,
                'MasterDataSSID' => $existingData->MasterDataSSID,
                'parent_id' => $existingData->SSID,
                'modified_ByID' => $userId,
                'createdBy' => $userId,
            ];

            $hasChanges = $existingData && (
                $existingData->book_name !== $logData['book_name'] ||
                $existingData->bhandar_code !== $logData['bhandar_code'] ||
                $existingData->alternate_name !== $logData['alternate_name'] ||
                $existingData->part !== $logData['part'] ||
                $existingData->publisher !== $logData['publisher'] ||
                $existingData->Kruti !== $logData['Kruti'] ||
                $existingData->author !== $logData['author'] ||
                $existingData->editor !== $logData['editor'] ||
                $existingData->page !== $logData['page'] ||
                $existingData->year_type !== $logData['year_type'] ||
                $existingData->year !== $logData['year'] ||
                $existingData->edition !== $logData['edition'] ||
                $existingData->subject !== $logData['subject'] ||
                $coverImageName != '' || $pdfName != ''
            );
         
            if($request->bhandar_note != $existingData->bhandar_note){             

                DB::table('BhandarData')->where('SSID', $request->ssid)->update(['bhandar_note' => $request->bhandar_note,'language' => $request->language]);

                if ($hasChanges) {
                    DB::table('MasterDataLog')->insert($logData);
                }
                
            }else{
                if ($hasChanges) {
                    DB::table('MasterDataLog')->insert($logData);
                }
            }
           

        } catch (\Exception $e) {
            echo "<pre>";
            print_r($e);
            echo "</pre>";
            exit;
            return redirect()->back()->with('error', 'Failed to update Bhandardata');
        }
        return redirect()->route('bhandarDatalistView')->with('success', 'Bhandardata changes have been updated successfully!');
    }

    public function add_bhandar_data(Request $request)
    {
        $bhandarData = DB::table('BhandarData');
        $years = DB::table('BhandarData')->select('year')->distinct()->get();
        $bhandarCode = DB::table('backend_bhandar')->get(['bhandar_code', 'sname', 'city']);
        $languages = DB::table('backend_language')->get('id', 'name');
        $book_size = DB::table('backend_booksize')->where('id', 'size');

        return view('backend.BhandarData.add_bhandar_data', compact('bhandarData', 'years', 'bhandarCode', 'languages', 'book_size'));
    }

    public function store_bhandarData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_name' => 'required',
            'bhandar_code' => 'required',
        ]);

        $changedColumns = [];
        $userId = Auth::user()->id;
        $size = trim($request->size);
        $book_number = trim($request->book_number);

        /* create serialized book number */
        $number = BookHelper::makeValid($size, $book_number, '');
        list($isValidNumber, $inValidMessage) = BookHelper::isValid($size, $number, '');

        if ($isValidNumber) {
            try {
                /* check the number is existing or not */
                $numberExist = DB::table('BhandarData')
                    ->where('bhandar_code', $request->bhandar_code)
                    ->where('book_number', $number)
                    ->exists();

                if ($validator->fails() || $numberExist) {
                    return response()->Json([
                        'status' => false,
                        'message' => 'Validation Error!',
                        $validator->messages()->isEmpty() ? "warning" : 'error' => $validator->messages()->isEmpty() ? ["The Book Number $size.$request->book_number has already exist!"] : $validator->messages(),
                    ]);
                }

                $masterDataSSID = $masterId = NULL;
                $alternate_name = $reference = '';

                /* check master data exist */
                $masterData = DB::table('MasterData')
                    ->where('MasterID', $request->master_id)
                    ->where('MasterID', '!=', NULL)
                    ->first();
                
                /* master data */
                $MData = [
                    // 'MasterID' => $masterId,
                    'year' => $request->year,
                    'page' => $request->page,
                    'part' => $request->part,
                    'size' => $request->size,
                    'note' => $request->note,
                    'Kruti' => $request->Kruti,
                    'author' => $request->author,
                    'editor' => $request->editor,
                    'subject' => $request->subject,
                    'language' => $request->language,
                    'publisher' => $request->publisher,
                    'book_name' => $request->book_name,
                    'alternate_name' => $alternate_name,
                    'book_number' => $number,
                    'createdBy' => $userId,
                    'year_type' => $request->year_type,
                    'created_date' => now(),
                ];

                if ($masterData) {
                    $masterDataSSID = $masterData->SSID;
                    $alternate_name = $masterData->alternate_name;
                    $masterId = $request->master_id;
                    /* set requested data */
                    $requestData = [
                        'book_name' => $request->book_name,
                        'part' => $request->part,
                        'author' => $request->author,
                        'editor' => $request->editor,
                        'year_type' => $request->year_type,
                        'year' => $request->year,
                        'language' => $request->language,
                        'page' => $request->page,
                        'publisher' => $request->publisher,
                        'subject' => $request->subject,
                    ];
                    /* check if requested data and master data column value has changed or not */
                    foreach ($requestData as $key => $value) {
        
                        if($key=='page'){
                            if(trim($masterData->$key) == 0)
                                $masterData->$key = '';                                 
                        }
                        if (is_string($masterData->$key) && ($masterData->$key === 'NULL' || $masterData->$key === 'null')) {
                            $masterData->$key = '';
                        }

                        if(trim($masterData->$key) != trim($value)){  
                            $changedColumns[] = $key;
                        }else{
                                // $changedColumns[] = '';
                        }
                    }
                    
                    /* if column value has changed then maintain its log  */
                    if(count($changedColumns) > 0){
                        $logdata = [ 
                            // 'book_number' => $masterData->book_number,
                            'JSID' => $masterData->JSID,
                            'parent_id' => $masterData->SSID,
                            'MasterID' => $masterData->MasterID,
                            'MasterDataSSID' => $masterData->SSID,
                        ];

                        $queryLog = DB::table('MasterDataLog')->insert(array_merge($MData, $logdata));
                        // $error = "data has been added to log table";
                    }

                } else {
                    $reference = $request->bhandar_code;                   

                    /* insert master data if not exist*/
                    $MasterData = MasterData::create($MData);
                    if ($MasterData) {
                        $masterDataSSID = $MasterData->SSID;

                        /* update master id */
                        DB::table('MasterData')->where('SSID', $MasterData->SSID)
                            ->update(['MasterID' => 'S' . $MasterData->SSID]);
                    }
                }

                $get_booksize = BookSize::where('bhandar_id', $request->bhandar_code)
                    ->where('size', $request->size)->first();

                if (empty($get_booksize)) {
                    $get_booksize = BookSize::create([
                        'bhandar_id' => $request->bhandar_code,
                        'size' => $request->size
                    ]);
                }

                $get_book_language = Language::where('bhandar_id', $request->bhandar_code)
                    ->where('name', $request->language)->first();

                if (empty($get_book_language)) {
                    $get_book_language = Language::create([
                        'bhandar_id' => $request->bhandar_code,
                        'name' => $request->language
                    ]);
                }                

                /* bhandar data */
                $bData = [
                    'MasterID' => $request->master_id ?? NULL,
                    'year' => $masterData->year ?? $request->year,
                    'page' => $masterData->page ?? $request->page,
                    'part' => $masterData->part ?? $request->part,
                    'size' => $masterData->size ?? $request->size,
                    'note' => $masterData->note ?? $request->note,
                    'Kruti' => $masterData->Kruti ?? $request->Kruti,
                    'author' => $masterData->author ?? $request->author,
                    'editor' => $masterData->editor ?? $request->editor,
                    'subject' => $masterData->subject ?? $request->subject,
                    'language' => $masterData->language ?? $request->language,
                    'publisher' => $masterData->publisher ?? $request->publisher,
                    'book_name' => $masterData->book_name ?? $request->book_name,
                    'language_id' => $get_book_language->id,
                    'size_id' => $get_booksize->id,
                    'alternate_name' => $alternate_name,
                    'book_number' => $number,
                    'no' => $book_number,
                    'user_id' => $userId,
                    'createdBy' => $userId,
                    'created_date' => now(),
                    'reference' => $reference,
                    'MasterDataSSID' => $masterDataSSID,
                    'bhandar_code' => $request->bhandar_code,
                ];

                /* insert Bhandar Data */
                $BhandarData = DB::table('BhandarData')->insert($bData);

                if ($BhandarData) {
                    /* get kruti data from session and insert into database */
                    $sessionData = Session::get('kruti');
                    if ($sessionData) {
                        foreach ($sessionData as $kruti) {
                            $data = [
                                'JSID' => $MasterData->JSID,
                                'MasterID' => 'S' . $MasterData->SSID,
                                'size' => $MasterData->size,
                                'book_name' => $MasterData->book_name,
                                'book_number' => $MasterData->book_number,
                                'part' => $MasterData->part,
                                'editor' => $MasterData->editor,
                                'year' => $MasterData->year,
                                'publisher' => $MasterData->publisher,
                                'note' => 'Child',
                                'pdf' => $MasterData->pdf,
                                'cover' => $MasterData->cover,
                                'book_index_no' => $MasterData->book_index_no,
                                'source' => $MasterData->source,
                                'parent_id' => $MasterData->SSID,
                                'createdBy' => $userId,
                                'Kruti' => $kruti['kruti'],
                                'author' => $kruti['author'],
                                'language' => $kruti['language'],
                                'page' => $kruti['page'],
                                'subject' => $kruti['subject'],
                            ];
                            $DBkruti = DB::table('kruti')->insert($data);
                        }
                        /* unset the session variable */
                        Session::forget('kruti');
                    }
                }
            } catch (\Exception $e) {
                // echo"<pre>"; print_r($e); echo"</pre>";
                // exit;
                return response()->Json(['status' => false, 'error' => ['Exception occcer, Failed to insert data into BhandarData']]);
            }
        } else {
            return response()->Json(['status' => false, 'error' => "Error occurred! Invalid Book Number: " . $inValidMessage]);
        }
        return response()->Json(['status' => true, 'success' => 'Bhandar data has been Added successfully!']);
    }
    public function confirm_bhandardata(Request $request)
    {
        $book_ids = explode(',', $request->input('ssid'));
        $book_data = [];

        foreach ($book_ids as $ssid) {
            $get_books = DB::table('BhandarData')->where('SSID', $ssid)->first(['SSID', 'book_name']);
            if ($get_books) {
                $book_data[] = $get_books;
            }
        }
        // dd($book_data);

        $summary_data = [
            'Books' => count($book_data),
        ];

        $object_data = [
            'Book' => collect($book_data)->map(function ($book) {
                return [
                    'url' => route('edit-bhandardata', ['ssid' => $book->SSID]),
                    'label' => $book->book_name,
                ];
            }),
        ];
        // dd($bhandar_summary, $count);  
        $breadcrumbs = [
            ['url' => route('bhandarDatalistView'), 'label' => 'Bhandar Data'],
            ['url' => '#', 'label' => 'Delete multiple objects']
        ];

        $data = [
            'type' => 'bhandar data',
            'breadcrumbs' => $breadcrumbs,
            'summarys' => $summary_data,
            'objects' => $object_data,
            'action_url' => route('delete-bhandardata'),
            'del_ids' => collect($book_data)->pluck('SSID'),
        ];

        return view('backend.dashboard.comm_confirm_msgs', $data);
    }

    public function deleteBhandarData(Request $request)
    {
        $ssid = $request->del_ids;
    
        DB::beginTransaction();
    
        try {
            // Fetch records from BhandarData
            $recordsToMove = BhandarData::whereIn('SSID', $ssid)->get();
           
            if ($recordsToMove->isEmpty()) {
                return redirect()->route('bhandarDatalistView')->withErrors(['error' => "No matching records found to delete."]);
            }    
            // Insert records into backend_deletedbook
            foreach ($recordsToMove as $record) {
                $data = $record->toArray();
                $data['created_at'] = Carbon::now()->format('Y-m-d H:i:s'); // Current timestamp
                $data['updated_at'] = Carbon::now()->format('Y-m-d H:i:s'); // Current timestamp
                $insertRecord = DB::table('backend_deletedbook')->insert($data);  
            }    
            // Delete the records from BhandarData
            BhandarData::whereIn('SSID', $ssid)->delete();
            DB::commit();

           return redirect()->route('bhandarDatalistView')->with(['success'=>"Bhandar data has been deleted successfully!"], 200);
        } catch (\Exception $e) {
            echo $e->getMessage();
            DB::rollBack();
         
            return redirect()->route('bhandarDatalistView')->withErrors(['error' => "Failed to delete records: " . $e->getMessage()]);
        }
    }

    public function get_bhandarcode_lang_size_dp(Request $request)
    {
        $bhandar_code = $request->query('bhandar_code');
        if (empty($bhandar_code)) {
            return response()->json([
                'success' => false,
                'data' => 'bhandar_code parameter required',
            ], 200);
        }

        $select_bhandar_data = DB::table('backend_bhandar')->where('bhandar_code', $bhandar_code)->first();
        if (!empty($select_bhandar_data->bhandar_code)) {
            $bhandar_id = $select_bhandar_data->bhandar_code;

            $language = DB::table('backend_language')->select('id', 'name')->where('bhandar_id', $bhandar_id)->get();
            $booksize = DB::table('backend_booksize')->select('id', 'size')->where('bhandar_id', $bhandar_id)->get();

            $status = true;
            $data = [
                'language' => $language,
                'booksize' => $booksize,
            ];
        } else {
            $status = false;
            $data = '';
        }

        return response()->json(['success' => $status, 'data' => $data], 200);
    }

    public function admin_master_data_filter(Request $request)
    {
        // Retrieve values from request
        $name = $request->input('name');
        $author = $request->input('author');
        $editor = $request->input('editor');
        $publisher = $request->input('publisher');

        // Check if all values are empty
        if (empty($name) && empty($alternateName) && empty($author) && empty($editor) && empty($publisher)) {
            return response()->json(['error' => 'At least one search parameter is required'], 400);
        }

        // Initialize query builder
        $query = DB::table('MasterData');

        // Apply search filters if values are provided
        if (!empty($name)) {
            $query->where('book_name', 'like', $name . '%');
        }
        if (!empty($author)) {
            $query->where('author', 'like', $author . '%');
        }
        if (!empty($editor)) {
            $query->where('editor', 'like', $editor . '%');
        }
        if (!empty($publisher)) {
            $query->where('publisher', 'like', $publisher . '%');
        }

        // get count
        $count = $query->count();
        // Execute query and get results
        $data = $query->select('*')->get();

        $data->transform(function ($item) {
            // Replace 'page' column with an empty string if its value is '0'
            if ($item->page == '0') {
                $item->page = '';
            }
            // Loop through each property of the item
            foreach ($item as $key => $value) {
                // Only replace 'NULL' or 'null' if the value is a string
                if (is_string($value) && ($value === 'NULL' || $value === 'null')) {
                    $item->$key = '';
                }
                // Format 'created_date' column to 'dd-mm-yy HH:mm:ss' if it exists and is valid
                if ($key == 'created_date') {
                    try {
                        $date = new DateTime($value);
                        $item->$key = $date->format('d-m-Y H:i:s'); // Format as 'dd-mm-yy HH:mm:ss'
                    } catch (Exception $e) {
                        // Handle invalid date format here if necessary
                        $item->$key = ''; // Or handle the error as needed
                    }
                }
            }
            return $item;
        });

        return response()->json(['recordsFiltered' => $count, 'data' => $data]);
    }

    // Converts digits from various numeral systems into standard ASCII digits for edition in import
    public function normalizeDigits($string)
    {
        return preg_replace_callback('/\p{N}/u', function ($match) {
            $char = $match[0];
            $digit = mb_ord($char);

            // Arabic-Indic digits (٠-٩)
            if ($digit >= 0x0660 && $digit <= 0x0669) {
                return chr($digit - 0x0660 + ord('0'));
            }
            // Extended Arabic-Indic digits (Persian, ۰-۹)
            if ($digit >= 0x06F0 && $digit <= 0x06F9) {
                return chr($digit - 0x06F0 + ord('0'));
            }
            // Devanagari digits (Hindi & Marathi, ०-९)
            if ($digit >= 0x0966 && $digit <= 0x096F) {
                return chr($digit - 0x0966 + ord('0'));
            }
            // Gujarati digits (૦-૯)
            if ($digit >= 0x0AE6 && $digit <= 0x0AEF) {
                return chr($digit - 0x0AE6 + ord('0'));
            }

            // Return the character as-is if it's not a digit from the above scripts
            return $char;
        }, $string);
    }

    // importing Bhandar data in BhandarData table  
    public function import_bhandar_data()
    {
        return view('backend.BhandarData.index');
    }

    public function import_bhandardata_format(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file',
            'input_format' => 'required|in:0,1',
        ]);

        $file = $request->file('import_file');
        $selectedFormat = $request->input('input_format');

        // Check if the uploaded file's extension matches the selected format
        $fileExtension = strtolower($file->getClientOriginalExtension());
        if ($fileExtension !== 'xlsx') {
            return redirect()->back()->with('error', 'Selected format does not match the file extension. Please select the correct format.');
        }

        try {
            $importedData = Excel::toArray([], $file);

            /* Define the expected header format */
            
            $expectedHeader = ['MasterID', 'size', 'number', 'bhandar_code', 'part', 'book_name', 'alternate_name', 'author', 'editor', 'language', 'page', 'year_type', 'year', 'edition','publisher', 'subject', 'note', 'bhandar_note']; 

            $expectedHeaderLower = array_map('strtolower', $expectedHeader);
            $header = array_map('strtolower', $importedData[0][0]);

            /* Create a mapping between the actual header and expected header */
            $headerMap = [];
            foreach ($expectedHeaderLower as $expectedColumn) {
                $index = array_search($expectedColumn, $header);
                if ($index !== false) {
                    $headerMap[$expectedColumn] = $index;
                } else {
                    return response()->json(['error' => 'The file is missing the required column: ' . $expectedColumn]);
                }
            }
            /* Process the rows in the Excel file */
            $bhandarData = [];
            foreach (array_slice($importedData[0], 1) as $data) {
                $row = [];
                foreach ($expectedHeaderLower as $column) {
                    $row[$column] = isset($headerMap[$column]) && isset($data[$headerMap[$column]]) ? $data[$headerMap[$column]] : null;
                }
                $bhandarData[] = $row;
            }

            /* Process the data Excel data */
            $process = $this->processBhandarDataFormat($bhandarData);

        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while importing data: ' . $e->getMessage()]);
        }

        if (isset($process['success']) && $process['success'] != '') {
            return response()->json(['success' => $process['success']]);
        } else {
            return response()->json(['error' => 'Data proccessing failed!']);
        }

    }

    public function processBhandarDataformat($bhandarData)
    {
        $errors = [];
        $userId = Auth::id();
        $csvReportData = [];
        $changedColumns = [];
        // dd($userId);

        foreach ($bhandarData as $row) {         

            $errors = [];
            $status = $message = '';
            $masterId = $row['masterid'] ?? '';
            $bhandarCode = $row['bhandar_code'] ?? '';
            $size = $row['size'] ?? '';
            $number = $row['number'] ?? '';
            $language = $row['language'] ?? NULL;


            // Apply normalizeDigits() on relevant fields
            $row['edition'] = isset($row['edition']) ? $this->normalizeDigits($row['edition']) : NULL;

            if (empty($bhandarCode)) {
                $errors[] = 'Bhandar code is missing';
            } else {
                $bhandarCodeExistOrNot = Bhandars::where('bhandar_code', 'LIKE', '%' . $bhandarCode . '%')->exists();
                if (!$bhandarCodeExistOrNot) {
                    $errors[] = 'Bhandar code not exists in system';
                }
            }

            if (empty($size)) {
                $errors[] = 'size is missing';
            }
            if (empty($number)) {
                $errors[] = 'number is missing';
            }


            $error_count = count($errors);
            // echo 'error counts = '.$error_count;

            if ($error_count != 0) {
                $errorsStr = implode(', ', $errors);
                $csvReportData[] = ['error' => $errorsStr, 'status' => 'Failed', 'row' => $row];
                continue;
            }

            $masterIdPrifix = substr($masterId, 0, 1);
            $source = '';
            switch ($masterIdPrifix) {
                case 'O':
                    $source = 'Operator';
                    break;
                case 'S':
                    $source = 'Shrutseva';
                    break;
                case 'B':
                    $source = 'BhavsundarMaharaj';
                    break;
                default:
                    $source = '';
                    break;
            }

            try {
                $get_booksize = BookSize::where('bhandar_id', $bhandarCode)
                    ->where('size', $row['size'])->first();

                if (empty($get_booksize)) {
                    $get_booksize = BookSize::create([
                        'bhandar_id' => $bhandarCode,
                        'size' => $row['size']
                    ]);
                }

                /* check the Bhandar Data record exists or not */
                $existing = DB::table('BhandarData')
                    ->where('bhandar_code', $bhandarCode)
                    ->where('book_number', $size . $number)
                    ->select('MasterDataSSID', 'SSID')->first();

                if (empty($masterId)) {
                 
                    if (empty($row['book_name'])) {
                        $csvReportData[] = ['error' => 'Book name missing', 'status' => 'Failed', 'row' => $row];
                        // echo " Book name missing";
                        continue;
                    }

                    if (empty($language)) {
                        $csvReportData[] = ['error' => 'language is missing', 'status' => 'Failed', 'row' => $row];
                        continue;
                    }

                    $language_id = $this->get_language($bhandarCode, $language);

                    $page = $row['page'] ? $row['page'] : NULL;

                    $source = 'Shrutseva';
                    $masterData = [
                        'size' => $row['size'],
                        // 'book_number' => $row['size'] . $row['number'],
                        'part' => $row['part'],
                        'book_name' => $row['book_name'],
                        'alternate_name' => $row['alternate_name'],
                        'author' => $row['author'],
                        'editor' => $row['editor'],
                        'language' => $row['language'],
                        'page' => $page,
                        'year_type' => $row['year_type'],
                        'year' => $row['year'],
                        'edition' => $row['edition'],
                        'publisher' => $row['publisher'],
                        'subject' => $row['subject'],
                        'note' => $row['note'],
                        'source' => $source,
                    ];
                   

                    $bhandarData = [
                        'MasterID' => null,
                        'size' => $row['size'],
                        'size_id' => $get_booksize->id,
                        'no' => $row['number'],
                        'book_number' => $row['size'] . $row['number'],
                        'part' => $row['part'],
                        'book_name' => $row['book_name'],
                        'alternate_name' => $row['alternate_name'],
                        'bhandar_code' => $row['bhandar_code'],
                        'author' => $row['author'],
                        'editor' => $row['editor'],
                        'language' => $row['language'],
                        'language_id' => $language_id,
                        'page' => $page,
                        'year' => $row['year'],
                        'edition' => $row['edition'],
                        'publisher' => $row['publisher'],
                        'subject' => $row['subject'],
                        'note' => $row['note'],
                        'bhandar_note' => $row['bhandar_note'],
                        'user_id' => $userId,
                        'reference' => $bhandarCode,
                    ];
                    
                    if ($existing) {
                        MasterData::where('SSID', $existing->MasterDataSSID)
                            ->update($masterData);

                        BhandarData::where('SSID', $existing->SSID)
                            ->update($bhandarData);

                        $message = 'Unmapped book ' . $size . $number . ' has been updated!';
                    } else {
                        $mData = [                           
                            'createdBy' => $userId,
                            'created_date' => now(),
                        ];

                        $masterData = MasterData::create(array_merge($masterData, $mData));
                        $masterData->MasterID = 'S' . $masterData->SSID;
                        $masterData->save();

                        BhandarData::create(array_merge($bhandarData, ['MasterDataSSID' => $masterData->SSID]));
                        $message = 'Inserted into unmapped Bhandar data!';
                    }
                    $status = 'Success';
                    // echo "<pre>"; print_r($message); echo "</pre>";
                } else {

                    $existingMasterData = MasterData::where('MasterID', $masterId)->first();
                  //  dd($row);
                    if (!empty($existingMasterData)) {
                        $language_id = $this->get_language($bhandarCode, $language ?? $existingMasterData->language);

                        $BhandarData = [
                            'MasterID' => $existingMasterData->MasterID,
                            'MasterDataSSID' => $existingMasterData->SSID,
                            'size' => $row['size'],
                            'size_id' => $get_booksize->id,
                            'book_number' => $row['size'] . $row['number'],
                            'no' => $row['number'],
                            'part' => $existingMasterData->part,
                            'book_name' => $existingMasterData->book_name,
                            'alternate_name' => $existingMasterData->alternate_name,
                            'bhandar_code' => $row['bhandar_code'],
                            'author' => $existingMasterData->author,
                            'editor' => $existingMasterData->editor,
                            'language' => $existingMasterData->language,
                            'language_id' => $language_id,
                            'page' => $existingMasterData->page,
                            'year_type' => $existingMasterData->year_type,
                            'year' => $existingMasterData->year,
                            'edition' => $existingMasterData->edition,
                            'publisher' => $existingMasterData->publisher,
                            'subject' => $existingMasterData->subject,
                            'note' => $existingMasterData->note,
                            'bhandar_note' => $row['bhandar_note'] ? $row['bhandar_note'] : NULL,
                            'pdf' => $existingMasterData->pdf,
                            'cover' => $existingMasterData->cover,
                            'book_index_img' => $existingMasterData->book_index_img,
                            'user_id' => $userId,
                            'createdBy' => $userId,
                            'created_date' => now(),
                            'reference' => 'Master',
                        ];

                        $changedMasterData = [
                            // 'MasterID' => $masterId,
                            'year' => $row['year'] ?? $existingMasterData->year,
                            'page' => $row['page'] ?? $existingMasterData->page,
                            'part' => $row['part'] ?? $existingMasterData->part,
                            'note' => $row['note'] ?? $existingMasterData->note,
                            'author' => $row['author'] ?? $existingMasterData->author,
                            'editor' => $row['editor'] ?? $existingMasterData->editor,
                            'subject' => $row['subject'] ?? $existingMasterData->subject,
                            'edition' => $row['edition'] ?? $existingMasterData->edition,                           
                            'publisher' => $row['publisher'] ?? $existingMasterData->publisher,
                            'book_name' => $row['book_name'] ?? $existingMasterData->book_name,
                            'alternate_name' => $row['alternate_name'] ?? $existingMasterData->alternate_name,
                            'Kruti' => $existingMasterData->Kruti,
                            // 'book_number' => $number,
                            'createdBy' => $userId,
                            'year_type' => $row['year_type'] ?? $existingMasterData->year_type,
                            'created_date' => now(),
                        ];
                   
                        /* set requested data */
                        $existingPageValue = $existingMasterData->page == 0 ? '' : $existingMasterData->page;
                        $requestData = [
                            'book_name' => $row['book_name'] ?? $existingMasterData->book_name,
                            'alternate_name' => $row['alternate_name'] ?? $existingMasterData->alternate_name,
                            'part' => $row['part'] ?? $existingMasterData->part,
                            'author' => $row['author'] ?? $existingMasterData->author,
                            'editor' => $row['editor'] ?? $existingMasterData->editor,
                            'year_type' => $row['year_type'] ?? $existingMasterData->year_type,
                            'year' => $row['year'] ?? $existingMasterData->year,
                            'edition' => $row['edition'] ?? $existingMasterData->edition,
                            'page' => $row['page'] ?? $existingPageValue,
                            'publisher' => $row['publisher'] ?? $existingMasterData->publisher,
                            'subject' => $row['subject'] ?? $existingMasterData->subject,
                        ];
                     
                        /* check if requested data and master data column value has changed or not */
                        foreach ($requestData as $key => $value) {
                            if($key=='page'){
                                if(trim($existingMasterData->$key) == 0)
                                    $existingMasterData->$key = '';                                 
                            }
                            if (is_string($existingMasterData->$key) && ($existingMasterData->$key === 'NULL' || $existingMasterData->$key === 'null')) {
                                $existingMasterData->$key = '';
                            }
                            if (is_string($value) && ($value === 'NULL' || $value === 'null')) {
                                $value = '';
                            }

                            if(trim($existingMasterData->$key) != trim($value)){  
                                $changedColumns[] = $key;
                            }else{
                                    // $changedColumns[] = '';
                            }
                        }
                        /* if column value has changed then maintain its log  */
                        if(count($changedColumns) > 0){
                            $logdata = [ 
                                // 'book_number' => $masterData->book_number,
                                'language' => $existingMasterData->	language,
                                'size' => $existingMasterData->size,
                                'parent_id' => $existingMasterData->SSID,
                                'MasterID' => $existingMasterData->MasterID,
                                'note' => $existingMasterData->note,                                
                                'MasterDataSSID' => $existingMasterData->SSID,
                            ];

                            if ($existing) {
                                $status = 'Failed';
                                $message = 'Book number ' . $size . $number . ' already exist!';
                            } else {                               
                                $BhandarDataInsert = DB::table("BhandarData")->insert($BhandarData);
                                $queryLog = DB::table('MasterDataLog')->insert(array_merge($changedMasterData, $logdata));
                                $message = 'Bhandar data inserted successfully!';
                                $status = 'Success';
                            }
                        }
                        else{
                            // dd('inside else');
                            if ($existing) {
                                BhandarData::where('SSID', $existing->SSID)
                                    ->update($BhandarData);

                                $message = 'Book ' . $size . $number . ' has been updated!';
                            } else {                               
                                $BhandarDataInsert = DB::table("BhandarData")->insert($BhandarData);
                                $message = 'Bhandar data inserted successfully!';
                            }                          
                            $status = 'Success';
                        }

                        // echo "<pre>"; print_r( $message ); echo "</pre>";
                    } else {
                        $status = 'Failed';
                        $message = 'master ID not availble in system!';
                        // echo "<pre>"; print_r( $message ); echo "</pre>";
                    }
                }
            } catch (\Exception $e) {
                if ($message == '') {
                    $status = 'Catch Failed!';
                    $message = $e->getMessage();
                }
                $csvReportData[] = ['error' => $message, 'status' => $status, 'row' => $row];
                $this->writeErrorsToCsv($csvReportData);
                // echo "<pre>"; print_r($e->getMessage()); echo "</pre>";
                // exit;
                return ['error' => 'An error occurred while importing data: ' . $e->getMessage()];
            }
            $csvReportData[] = ['error' => $message, 'status' => $status, 'row' => $row];
        }

        $this->writeErrorsToCsv($csvReportData);
        return ['success' => 'Data has been imported successfully.'];
    }

    private function writeErrorsToCsv($csvReport_Data)
    {
        $FilePath = storage_path('app/public/bhandarDataImport_report.xlsx');
        $header = ["Bhandar code", "MasterID", "Size", "Number", "Book Name", "Status", "Message", "Uploaded At"];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($header, null, 'A1');
        $row = 2;

        /* Iterate through your data and write each row to the spreadsheet */
        foreach ($csvReport_Data as $csvReportData) {
            $sheet->setCellValue('A' . $row, $csvReportData['row']['bhandar_code']);
            $sheet->setCellValue('B' . $row, $csvReportData['row']['masterid']);
            $sheet->setCellValue('C' . $row, $csvReportData['row']['size']);
            $sheet->setCellValue('D' . $row, $csvReportData['row']['number']);
            $sheet->setCellValue('E' . $row, $csvReportData['row']['book_name']);
            $sheet->setCellValue('F' . $row, $csvReportData['status']);
            $sheet->setCellValue('G' . $row, $csvReportData['error']);
            $sheet->setCellValue('H' . $row, now());
            $row++;
        }

        $writer = new Xlsx($spreadsheet);

        /* Unlink the old file if it exists */
        if (file_exists($FilePath)) {
            unlink($FilePath);
        }
        $writer->save($FilePath);
    }

    public function exportData()
    {
        $filePath = storage_path('app/data.xlsx');
        return response()->download($filePath, 'downloadData.xlsx');
    }

    public function exportBhandarData(Request $request)
    {
        //dd($request->all());
        ini_set('max_execution_time', 1000);
        ini_set('memory_limit', -1);
        $selectedIds = explode(',', $request->input('selected_ids'));
        $filePath = storage_path('app/public/BhandarData.xlsx');
        $header = ['Bhandar Code', 'MasterID', 'Size', 'Number', 'Part', 'Name', 'Alternate name', 'Kruti', 'Author', 'Editor', 'Language', 'Page','Year Type', 'Year','Edition', 'Publisher', 'Subject', 'Note', 'pdf', 'cover', 'index','Created By', 'Created Date'];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($header, null, 'A1');
        $columnMap = [
                'MasterId'    => 'MasterID',
                'bhandar_code' => 'bhandar_code',
                'book_name'    => 'book_name',
                'author'       => 'author',
                'editor'       => 'editor',
                'language'     => 'language',
                'publisher'    => 'publisher',
            ];


            $dataQuery = DB::table('BhandarData')
            ->select([
                'bhandar_code', 'MasterID', 'size', 'book_number', 'part', 'book_name',
                'alternate_name', 'Kruti', 'author', 'editor', 'language', 'page',
                'year_type', 'year', 'edition', 'publisher', 'subject', 'note',
                'pdf', 'cover', 'book_index_img', 'createdBy', 'created_at','created_date'
            ])
            ->where('deleted_at', 0);

            // Apply dynamic search filter
            if ($request->has('column') && $request->has('searchtext')) {
                $inputColumn = $request->input('column');
                $searchText = $request->input('searchtext');

                if (array_key_exists($inputColumn, $columnMap)) {
                    $dbColumn = $columnMap[$inputColumn];
                    $dataQuery->where($dbColumn,$searchText);
                }
            }


        if ($request->input('selected_ids') != NULL) {
           
            $dataQuery->whereIn('SSID', $selectedIds);
            $data = $dataQuery->get();
            $rows = [];
            foreach ($data as $item) {

                $users = DB::table('users')
                ->select('email')
                ->where('id', $item->createdBy)
                ->first();
            $item->createdBy = $users ? $users->email : null;

                  
                $rows[] = [
                    $item->bhandar_code,
                    $item->MasterID,
                    $item->size,
                    $item->book_number,
                    $item->part,
                    $item->book_name,
                    $item->alternate_name,
                    $item->Kruti,
                    $item->author,
                    $item->editor,
                    $item->language,
                    $item->page,
                    $item->year_type,
                    $item->year,
                    // $item->year_type ?? $item->year ?? '',
                    $item->edition,
                    $item->publisher,
                    $item->subject,
                    $item->note,
                    $item->pdf,
                    $item->cover,
                    $item->book_index_img,
                    $item->createdBy,
                    $item->created_at
                ];
            }
            // Write all rows in one go
            $sheet->fromArray($rows, null, 'A2');

        } else {
            // dd('inside else');
            // Handle pagination and batching if no selected IDs
            $fileCount = $request->file_count;
            $batchSize = 10000;
            $currentPage = $fileCount - 9;

            while ($currentPage <= $fileCount) {
                $dataBatch = $dataQuery->skip(($currentPage - 1) * $batchSize)
                    ->take($batchSize)
                     ->when(
                            $request->input('date_from') && $request->input('date_to'),
                            function (Builder $builder) use ($request) {
                                $builder->whereBetween('created_date', [
                                    $request->input('date_from'), 
                                    Carbon::parse($request->input('date_to'))->endOfDay()->toDateTimeString(),
                                ]);
                            }
                        )
                    ->orderBy('SSID', 'ASC') 
                    ->get();
               // dd($dataBatch);
                /* Exit loop if no more data */
                if ($dataBatch->isEmpty()) {
                    break;
                } 
             

                $rows = [];
                foreach ($dataBatch as $item) {
                $users = DB::table('users')
                ->select('email')
                ->where('id', $item->createdBy)
                ->first();

            $item->createdBy = $users ? $users->email : null;

                    $rows[] = [
                        $item->bhandar_code,
                        $item->MasterID,
                        $item->size,
                        $item->book_number,
                        $item->part,
                        $item->book_name,
                        $item->alternate_name,
                        $item->Kruti,
                        $item->author,
                        $item->editor,
                        $item->language,
                        $item->page,
                        $item->year_type,
                        $item->year,
                        // $item->year_type ?? '' . $item->year ?? '',
                        $item->edition,
                        $item->publisher,
                        $item->subject,
                        $item->note,
                        $item->pdf,
                        $item->cover,
                        $item->book_index_img,
                        $item->createdBy,
                        $item->created_at
                    ];
                }
                   //dd($rows);
                // Write all rows in one go
                $startRow = $sheet->getHighestRow() + 1;
                $sheet->fromArray($rows, null, 'A' . $startRow);
                $currentPage++;
            }
        }

        // Save the file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        return response()->download($filePath, 'BhandarData.xlsx');
    }

    private function get_language($bhandarCode, $lang)
    {
        $get_book_language = Language::where('bhandar_id', $bhandarCode)
            ->where('name', $lang)->first();

        if (empty($get_book_language)) {
            $get_book_language = Language::create([
                'bhandar_id' => $bhandarCode,
                'name' => $lang
            ]);
        }
        return $get_book_language->id;
    }



    public function import_one_time_bhandardata_format(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file',
            'input_format' => 'required|in:0,1',
        ]);

        // Retrieve the uploaded file and the selected format
        $file = $request->file('import_file');
        $selectedFormat = $request->input('input_format');

        // Define acceptable file extensions
        $formatExtensions = [
            0 => 'csv',
            1 => 'xls',
        ];

        // Check if the uploaded file's extension matches the selected format
        $fileExtension = strtolower($file->getClientOriginalExtension());
        if ($fileExtension !== $formatExtensions[$selectedFormat]) {
            return redirect()->back()->with('error', 'Selected format does not match the file extension. Please select the correct format.');
        }

        // Open the file for reading
        $handle = fopen($file->path(), 'r');
        $header = fgetcsv($handle); // Read the header row

        // Define the expected header format
        $expectedHeader = ['JSID', 'MasterID', 'size', 'number', 'bhandar_code', 'part', 'book_name', 'alternate_name', 'author', 'editor', 'language', 'page', 'year_type', 'year', 'publisher', 'subject', 'note', 'kruti'];

        // Normalize headers to lowercase for comparison
        $headerLower = array_map('strtolower', $header);
        $expectedHeaderLower = array_map('strtolower', $expectedHeader);

        // Check if all expected headers are present in the uploaded file
        $missingHeaders = array_diff($expectedHeaderLower, $headerLower);
        if (!empty($missingHeaders)) {
            fclose($handle);
            return redirect()->back()->with('error', 'The header row is missing expected columns: ' . implode(', ', $missingHeaders));
        }

        // Create a map of headers to their positions
        $headerMap = array_flip($headerLower);

        $rowLimit = 25; // Define batch size for processing
        $totalRows = count(file($file->path())) - 1; // Exclude the header row

        // Process the file in batches
        while (!feof($handle)) {
            $bhandarData = [];
            $batchSize = min($rowLimit, $totalRows);

            // Read rows in batches
            for ($i = 0; $i <= $batchSize; $i++) {
                $data = fgetcsv($handle);
                if ($data === false) {
                    break;
                }

                // Map data to the correct columns based on the headerMap
                $row = [];
                foreach ($expectedHeaderLower as $column) {
                    $row[$column] = isset($headerMap[$column]) ? $data[$headerMap[$column]] : null;
                }
                $bhandarData[] = $row;
            }
            //echo "<pre>"; print_r($bhandarData); echo "</pre>";
            $totalRows -= $batchSize;
            try {
                // $this->processBhandarDataformat($bhandarData); // Process the data
                $this->processBulkBhandarDataformatOnce($bhandarData); // Process the data
            } catch (\Exception $e) {
                fclose($handle); // Close the file
                // print_r($e->getMessage());
                return redirect()->back()->with('error', 'An error occurred while importing data: ' . $e->getMessage());
            }
        }
        fclose($handle); // Close the file
        return redirect()->back()->with('success', 'Data has been imported successfully.');
    }

    public function processBulkBhandarDataformatOnce($bhandarData)
    {
        $masterId = [];
        foreach ($bhandarData as $row) {
            $bhandarCode = $row['bhandar_code'] ?? '';
            $size = $row['size'] ?? '';
            $number = $row['number'] ?? '';

            $masterData = DB::table('MasterData')->select('SSID', 'language')->where('MasterID', $row['masterid'])->get();
            // Skip the row if MasterID or book_name is empty or null
            if (empty($row['masterid']) || empty($row['book_name']) || $row['masterid'] == 'NULL' || count($masterData) == 0) {
                dd($row['masterid']);
                continue;
            }

            /* check the record exists or not */
            $existing = DB::table('BhandarData')
                ->where('MasterID', $row['masterid'])
                ->where('bhandar_code', $bhandarCode)
                ->where('book_number', $size . $number)->exists();

            $masterIdPrifix = substr($row['masterid'], 0, 1);
            $source = '';
            switch ($masterIdPrifix) {
                case 'O':
                    $source = 'Operator';
                    break;
                case 'S':
                    $source = 'Shrutseva';
                    break;
                case 'B':
                    $source = 'BhavsundarMaharaj';
                    break;
                default:
                    $source = '';
                    break;
            }

            if ($row['page'] == '') {
                $page = 0;
            } else {
                $page = $row['page'];
            }

            $get_booksize = BookSize::firstOrCreate(
                ['bhandar_id' => $bhandarCode],
                ['size' => $size]
            );

            $get_book_language = Language::firstOrCreate(
                ['bhandar_id' => $bhandarCode],
                ['name' => $masterData[0]->language]
            );

            $existingsize = DB::table('BhandarData')
                ->where('bhandar_code', $bhandarCode)
                ->where('size_id', $get_booksize->id)
                ->where('no', $number)->exists();

            if ($existing || $existingsize) {
                echo "existing : " . $existing;
                echo "<br>";
                echo "existingsize : " . $existingsize;
                $masterId[] = $row['masterid'];
                continue;
            }

            $data = ([
                'MasterDataSSID' => $masterData[0]->SSID,
                'MasterID' => $row['masterid'],
                'size' => $row['size'],
                'size_id' => $get_booksize->id,
                'JSID' => $row['jsid'] ?? NULL,
                'book_number' => $row['size'] . $row['number'],
                'no' => $row['number'],
                'part' => $row['part'],
                'book_name' => $row['book_name'],
                'alternate_name' => $row['alternate_name'],
                'bhandar_code' => $row['bhandar_code'],
                'Kruti' => $row['kruti'],
                'author' => $row['author'],
                'editor' => $row['editor'],
                'language' => $row['language'],
                'language_id' => $get_book_language->id,
                'page' => $page,
                'year' => $row['year'],
                'publisher' => $row['publisher'],
                'subject' => $row['subject'],
                'note' => $row['note'],
                'reference' => $row['bhandar_code'],
            ]);

            $krutiData = ([
                'JSID' => $row['jsid'] ?? NULL,
                'MasterID' => $row['masterid'],
                'size' => $row['size'],
                'book_number' => $row['size'] . $row['number'],
                'no' => $row['number'],
                'part' => $row['part'],
                'book_name' => $row['book_name'],
                'bhandar_code' => $row['bhandar_code'],
                'Kruti' => $row['kruti'],
                'author' => $row['author'],
                'editor' => $row['editor'],
                'language' => $row['language'],
                'page' => $page,
                'year' => $row['year'],
                'publisher' => $row['publisher'],
                'subject' => $row['subject'],
                'note' => $row['note'],

            ]);

            try {
                // Insert Parent record into BhandarData table
                if ($row['note'] != 'Child') {
                    DB::table('BhandarData')->insertGetId($data);
                }

                // Insert Child record into kruti table
                if (isset($row['note']) && $row['note'] == 'Child') {
                    $kruti = DB::table('kruti')->insertGetId($krutiData);
                }

            } catch (\Illuminate\Database\QueryException $e) {
                throw $e;
            }
        }
        echo "<pre>";
        print_r($masterId);
        echo "</pre>";
        exit;
    }



    public function importBooks(Request $request)
    {
        $file = $request->file('import_file');
        $selectedFormat = $request->input('input_format');

        // Check if the uploaded file's extension matches the selected format
        $fileExtension = strtolower($file->getClientOriginalExtension());
        if ($fileExtension !== 'xlsx') {
            return redirect()->back()->with('error', 'Selected format does not match the file extension. Please select the correct format.');
        }
        try {
            $importedData = Excel::toArray([], $file);

            /* Define the expected header format */
            $expectedHeader = ['book_number', 'book_name', 'author', 'language', 'pages', 'year', 'publisher', 'notes', 'editor', 'kruti', 'subject', 'issued', 'no', 'size'];

            $expectedHeaderLower = array_map('strtolower', $expectedHeader);
            $header = array_map('strtolower', $importedData[0][0]);

            /* Create a mapping between the actual header and expected header */
            $headerMap = [];
            foreach ($expectedHeaderLower as $expectedColumn) {
                $index = array_search($expectedColumn, $header);
                if ($index !== false) {
                    $headerMap[$expectedColumn] = $index;
                } else {
                    return redirect()->back()->with('error', 'The file is missing the required column: ' . $expectedColumn);
                }
            }

            /* Process the rows in the Excel file */
            $bhandarData = [];
            foreach (array_slice($importedData[0], 1) as $data) {
                $row = [];
                foreach ($expectedHeaderLower as $column) {
                    $row[$column] = isset($headerMap[$column]) && isset($data[$headerMap[$column]]) ? $data[$headerMap[$column]] : null;
                }
                $bhandarData[] = $row;
            }

            /* Process the data Excel data */
            $process = $this->processDeletedBooks($bhandarData);
            dd($process);
        } catch (\Exception $e) {
            dd($e);

            return response()->json(['error' => 'An error occurred while importing data: ' . $e->getMessage()]);
        }

        if (isset($process['success']) && $process['success'] != '') {
            return response()->json(['success' => $process['success']]);
        } else {
            return response()->json(['error' => 'Data proccessing failed!']);
        }
    }

    public function processBooks($bhandarData)
    {

        $errors = [];
        $userId = Auth::id();
        $csvReportData = [];

        foreach ($bhandarData as $row) {
            $errors = [];
            $status = $message = '';
            $bhandarCode = 'T01';
            $language = $row['language'] ?? NULL;
            if ($row['book_name'] == 'end') {
                echo 'all done';
                break;
            }


            $exitsting = BhandarData::where('bhandar_code', $bhandarCode)
                ->where('book_number', $row['book_number'])->exists();

            try {
                if (!$exitsting) {
                    echo ($row['book_number'] . ' ' . 'not exists!');

                    if (isset($row['book_number'])) {
                        preg_match('/([A-Za-z]+)(\d+)/', $row['book_number'], $matches);

                        if ($matches) {
                            $size = $matches[1]; // Contains the alphabetic part
                            $no = $matches[2];   // Contains the numeric part
                        } else {
                            echo ("No match found.");
                        }
                    }

                    $get_booksize = BookSize::where('bhandar_id', $bhandarCode)
                        ->where('size', $size)->first();

                    if (empty($get_booksize)) {
                        $get_booksize = BookSize::create([
                            'bhandar_id' => $bhandarCode,
                            'size' => $size,
                        ]);
                    }

                    $language_id = $this->get_language($bhandarCode, $language);

                    $page = $row['page'] ? Null : 0;
                    $year = $year_type = NULL;

                    if ($row['year'] != '' && $row['year'] != '-') {
                        $splitYear = explode('.', $row['year']);
                        echo "<pre>";
                        print_r($splitYear);
                        echo "</pre>";

                        $year_type = $splitYear[0];
                        $year = isset($splitYear[1]);
                        echo $year;
                    }

                    $source = 'Shrutseva';
                    $masterData = [
                        'book_name' => $row['book_name'],
                        'author' => $row['author'],
                        'language' => $row['language'],
                        'page' => $page,
                        'year' => $year,
                        'year_type' => $year_type,
                        'publisher' => $row['publisher'],
                        'note' => $row['note'],
                        'size' => $row['size'],
                        'editor' => $row['editor'],
                        'book_number' => $row['size'] . $row['number'],
                        'part' => NULL,
                        'alternate_name' => NULL,
                        'subject' => $row['subject'],
                        'source' => $source,
                    ];

                    $bhandarData = [
                        'book_name' => $row['book_name'],
                        'author' => $row['author'],
                        'language' => $row['language'],
                        'language_id' => $language_id,
                        'page' => $page,
                        'year' => $year,
                        'year_type' => $year_type,
                        'publisher' => $row['publisher'],
                        'note' => $row['note'],
                        'size' => $row['size'],
                        'size_id' => $get_booksize->id,
                        'user_id' => $userId,
                        'editor' => $row['editor'],
                        'book_number' => $row['size'] . $row['number'],
                        'no' => $no,
                        'issued' => $row['issued'],
                        'issued_date' => $row['issued_date'],
                        'issued_to_address' => $row['issued_to_address'],
                        'issued_to_email' => $row['issued_to_email'],
                        'issued_to_mobile' => $row['issued_to_mobile'],
                        'issued_to_name' => $row['issued_to_name'],
                        'issued_id' => $row['issued_id'],
                        'issued_to_note' => $row['issued_to_note'],
                        'kruti' => $row['kruti'],
                        'issued_to_id' => $row['issued_to_id'],
                        'subject' => $row['subject'],
                        'part' => NULL,
                        'alternate_name' => NULL,
                        'bhandar_code' => $bhandarCode,
                        'reference' => $bhandarCode,
                    ];

                    $issued = [
                        'issued' => $row['issued'],
                        'issued_date' => $row['issued_date'],
                        'issued_to_address' => $row['issued_to_address'],
                        'issued_to_email' => $row['issued_to_email'],
                        'issued_to_mobile' => $row['issued_to_mobile'],
                        'issued_to_name' => $row['issued_to_name'],
                        'issued_id' => $row['issued_id'],
                        'issued_to_notes' => $row['issued_to_note'],
                        'kruti' => $row['kruti'],
                        'user_id' => $userId,
                        'issued_to_id' => $row['issued_to_id'],
                    ];

                    $masterData = MasterData::create($masterData);
                    $masterData->MasterID = 'S' . $masterData->SSID;
                    $masterData->save();

                    BhandarData::create(array_merge($bhandarData, ['MasterID' => $masterData->MasterID, 'MasterDataSSID' => $masterData->SSID]));
                    echo $message = $row['size'] . $row['number'] . ' Inserted into Bhandar data!';

                    if ($row['kruti'] != '' && $row['kruti'] != '-') {
                        $masterData = DB::table('kruti')->insert([
                            'JSID' => $masterData->JSID,
                            'MasterID' => 'S' . $masterData->SSID,
                            'size' => $masterData->size,
                            'book_name' => $masterData->book_name,
                            'book_number' => $masterData->book_number,
                            'part' => $masterData->part,
                            'editor' => $masterData->editor,
                            'year' => $masterData->year,
                            'publisher' => $masterData->publisher,
                            'note' => 'Child',
                            'source' => $masterData->source,
                            'parent_id' => $masterData->SSID,
                            'createdBy' => $userId,
                            'Kruti' => $row['kruti'],
                            'author' => $row['author'],
                            'language' => $row['language'],
                            'page' => $row['page'],
                            'subject' => $row['subject'],
                        ]);
                    }
                }

                // echo "<pre>"; print_r($message); echo "</pre>";

            } catch (\Exception $e) {
                echo "<pre>";
                print_r($e->getMessage());
                echo "</pre>";
                exit;
                // return ['error' => 'An error occurred while importing data: ' . $e->getMessage()];
            }
            $csvReportData[] = ['error' => $message, 'status' => $status, 'row' => $row];
        }

        return ['success' => 'Data has been imported successfully.'];
    }



    public function processDeletedBooks($bhandarData)
    {

        $errors = [];
        $userId = Auth::id();
        $csvReportData = [];

        foreach ($bhandarData as $row) {
            $errors = [];
            $status = $message = '';
            $bhandarCode = 'T01';
            $language = $row['language'] ?? NULL;

            try {
                

                $get_booksize = BookSize::where('bhandar_id', $bhandarCode)
                    ->where('size', $row['size'])->first();

                if (empty($get_booksize)) {
                    $get_booksize = BookSize::create([
                        'bhandar_id' => $bhandarCode,
                        'size' => $row['size'],
                    ]);
                }

                if(isset($language)){
                    $language_id = $this->get_language($bhandarCode, $language);
                }

                $page = $row['pages'] ? Null : 0;
                $year = $year_type = NULL;

                if ($row['year'] != '' && $row['year'] != '-') {
                    $splitYear = explode('.', $row['year']);
                    echo "<pre>";
                    print_r($splitYear);
                    echo "</pre>";

                    $year_type = $splitYear[0];
                    $year = isset($splitYear[1]);
                    echo $year;
                }

                $bhandarData = [
                    'book_name' => $row['book_name'],
                    'author' => $row['author'],
                    'language' => $row['language'],
                    'language_id' => $language_id ?? 1,
                    'page' => $page,
                    'year' => $year,
                    'year_type' => $year_type,
                    'publisher' => $row['publisher'],
                    'note' => $row['notes'],
                    'size' => $row['size'],
                    'size_id' => $get_booksize->id,
                    'user_id' => $userId,
                    'editor' => $row['editor'],
                    'book_number' => $row['book_number'],
                    'no' => $row['no'],
                    'issued' => 0,
                    'issued_date' => NULL,
                    'issued_to_address' => NULL,
                    'issued_to_email' => NULL,
                    'issued_to_mobile' => NULL,
                    'issued_to_name' => NULL,
                    'issued_id' => NULL,
                    'issued_to_note' => NULL,
                    'kruti' => $row['kruti'],
                    'issued_to_id' => NULL,
                    'subject' => $row['subject'],
                    'part' => NULL,
                    'alternate_name' => NULL,
                    'bhandar_code' => $bhandarCode,
                    'reference' => $bhandarCode,
                    'deleted_at' => 1,
                ];

                $deleted = BhandarData::create($bhandarData);
                echo $message = $row['book_number'] . ' Inserted into deleted Bhandar data!';



                // echo "<pre>"; print_r($message); echo "</pre>";

            } catch (\Exception $e) {
                echo "<pre>";
                print_r($e->getMessage());
                echo "</pre>";
                exit;
                // return ['error' => 'An error occurred while importing data: ' . $e->getMessage()];
            }
            $csvReportData[] = ['error' => $message, 'status' => $status, 'row' => $row];
        }

        return ['success' => 'Data has been imported successfully.'];
    }
    
    public function change_reference(Request $request)
{
    if ($request->isMethod('get')) {
        $bhandarCodes = DB::table('backend_bhandar')->get('bhandar_code');
        return view('backend.BhandarData.change-reference', compact('bhandarCodes'));
    }

    if ($request->isMethod('post')) {

        DB::beginTransaction();

        try {
            // Inputs
            $bhandarCodes = (array) $request->input('bhandar_code');
            $fromMasterID = $request->input('from_masterID');
            $toMasterID   = $request->input('to_masterID');

            // Validation
            if (!$bhandarCodes || !$fromMasterID || !$toMasterID) {
                return back()->with('error', 'Please fill in all fields.');
            }

            if ($fromMasterID == $toMasterID) {
                return back()->with('error', 'Both MasterIDs cannot be same.');
            }

            // Get target MasterData
            $masterData = DB::table('MasterData')
                ->where('MasterID', $toMasterID)
                ->first();

            if (!$masterData) {
                return back()->with('error', 'Target MasterData not found.');
            }

            // Normalize input codes
            $bhandarCodes = array_map(function ($code) {
                return trim($code);
            }, $bhandarCodes);

            // Fetch matching BhandarData (single query)
            $bhandarData = DB::table('BhandarData')
                ->whereIn('bhandar_code', $bhandarCodes)
                ->where('MasterID', $fromMasterID)
                ->get(['bhandar_code']);

            if ($bhandarData->isEmpty()) {
                return back()->with('error', 'No matching BhandarData found.');
            }

            // Unique codes
            $uniqueCodes = $bhandarData->pluck('bhandar_code')
                ->map(fn($c) =>trim($c))
                ->unique()
                ->values()
                ->toArray();

            // -----------------------------
            // 🔹 Language handling (optimized)
            // -----------------------------
            $languageName = trim($masterData->language);

            $language = DB::table('backend_language')
                ->where('name', $languageName)
                ->first();

            if (!$language) {
                $languageId = DB::table('backend_language')->insertGetId([
                    'name' => $languageName,
                    'bhandar_id' => null // optional if needed
                ]);
            } else {
                $languageId = $language->id;
            }

            // -----------------------------
            // 🔹 Prepare update data
            // -----------------------------
            $updateData = [
                'MasterID'          => $masterData->MasterID,
                'MasterDataSSID'    => $masterData->SSID,
                'book_name'         => $masterData->book_name,
                'alternate_name'    => $masterData->alternate_name,
                'year_type'         => $masterData->year_type,
                'year'              => $masterData->year,
                'edition'           => $masterData->edition,
                'page'              => $masterData->page,
                'part'              => $masterData->part,
                'note'              => $masterData->note,
                'Kruti'             => $masterData->Kruti,
                'author'            => $masterData->author,
                'editor'            => $masterData->editor,
                'subject'           => $masterData->subject,
                'publisher'         => $masterData->publisher,
                'language'          => $languageName,
                'language_id'       => $languageId,
            ];

            // -----------------------------
            // 🔹 Bulk update BhandarData
            // -----------------------------
            DB::table('BhandarData')
                ->whereIn('bhandar_code', $uniqueCodes)
                ->where('MasterID', $fromMasterID)
                ->update($updateData);
           
             // -----------------------------
             // 🔹 Update ismap for BOTH masters (with 0 logic)
            // -----------------------------

        // ---- 1. REMOVE from OLD master ----
        $fromMaster = DB::table('MasterData')
            ->where('MasterID', $fromMasterID)
            ->first();

        if ($fromMaster) {

            $oldIsmap = $fromMaster->ismap ?? '';

            $oldCodes = $oldIsmap
                ? array_map('trim', explode(',', strtoupper($oldIsmap)))
                : [];

            // Remove selected codes
            $updatedOldCodes = array_diff($oldCodes, $uniqueCodes);

            // If empty → store '0'
            $finalOldIsmap = empty($updatedOldCodes) ? '0' : implode(',', $updatedOldCodes);

            DB::table('MasterData')
                ->where('MasterID', $fromMasterID)
                ->update([
                    'ismap' => $finalOldIsmap
                ]);
        }

            // ---- 2. ADD to NEW master ----
            $currentIsmap = $masterData->ismap ?? '';

            $existingCodes = $currentIsmap
                ? array_map('trim', explode(',', strtoupper($currentIsmap)))
                : [];

            // 🔥 Remove '0' if exists
            $existingCodes = array_diff($existingCodes, ['0']);

            // Merge new codes
            $finalCodes = array_unique(array_merge($existingCodes, $uniqueCodes));

            // If still empty → '0' (edge case)
            $finalNewIsmap = empty($finalCodes) ? '0' : implode(',', $finalCodes);

            DB::table('MasterData')
                ->where('MasterID', $toMasterID)
                ->update([
                    'ismap' => $finalNewIsmap
                ]);

            DB::commit();

            return back()->with('success', 'Reference changed successfully!');

        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', 'Error: ' . $e->getMessage());
        }
        }
    }
   public function preview_change_reference(Request $request)
{
    $draw   = $request->input('draw', 1);
    $start  = $request->input('start', 0);
    $length = $request->input('length', 10);

    $bhandarCodes = (array) $request->input('bhandar_code');
    $fromMasterID = trim($request->input('from_master_id'));
    $toMasterID   = trim($request->input('to_master_id'));

    // Validation
    if (!$fromMasterID || !$toMasterID) {
        return response()->json([
            'draw' => $draw,
            'recordsTotal' => 0,
            'recordsFiltered' => 0,
            'data' => [],
            'error' => 'Please enter From MasterID and To MasterID.'
        ]);
    }

    if ($fromMasterID == $toMasterID) {
        return response()->json([
            'draw' => $draw,
            'recordsTotal' => 0,
            'recordsFiltered' => 0,
            'data' => [],
            'error' => 'Both MasterIDs cannot be same.'
        ]);
    }

    // Check To MasterID exists
    $masterData = DB::table('masterdata')
        ->where('MasterID', $toMasterID)
        ->first();

    if (!$masterData) {
        return response()->json([
            'draw' => $draw,
            'recordsTotal' => 0,
            'recordsFiltered' => 0,
            'data' => [],
            'error' => 'Target MasterData not found.'
        ]);
    }


    // Sorting
    $columnIndex    = $request->input('order.0.column', 0);
    $sortDirection  = $request->input('order.0.dir', 'asc');

    $columns = [
        0 => 'masterdata.MasterID',
        1 => 'masterdata.book_name',
        2 => 'masterdata.author',
        3 => 'masterdata.created_date',
    ];

    $orderByColumn = $columns[$columnIndex] ?? 'masterdata.MasterID';

    $userId  = Auth::id();
    $isAdmin = Auth::user()->is_superuser;

    /*
    |--------------------------------------------------------------------------
    | Base Query
    |--------------------------------------------------------------------------
    */

    $baseQuery = DB::table('masterdata')
        ->whereIn('masterdata.MasterID', [$fromMasterID, $toMasterID]);

    /*
    |--------------------------------------------------------------------------
    | User Permission Filter
    |--------------------------------------------------------------------------
    */

    if (!$isAdmin) {

        /*$baseQuery->join(
            'backend_adminuser_bhandars',
            'BhandarData.bhandar_code',
            '=',
            'backend_adminuser_bhandars.bhandar_id'
        )
        ->where('backend_adminuser_bhandars.adminuser_id', $userId); */
    }

    /*
    |--------------------------------------------------------------------------
    | Total Count
    |--------------------------------------------------------------------------
    */

    $totalRecored = (clone $baseQuery)->count();

    /*
    |--------------------------------------------------------------------------
    | Data List
    |--------------------------------------------------------------------------
    */

    $masterDataList = clone $baseQuery;
    $masterDataList = $masterDataList->select(
        'masterdata.*',
        DB::raw("
            CASE
                WHEN masterdata.MasterID = '".$fromMasterID."'
                THEN 'FROM MASTER'

                WHEN masterdata.MasterID = '".$toMasterID."'
                THEN 'TO MASTER'

                ELSE ''
            END as reference_type
        ")
    )
    ->orderByRaw("
        CASE
            WHEN masterdata.MasterID = '".$fromMasterID."' THEN 1
            WHEN masterdata.MasterID = '".$toMasterID."' THEN 2
            ELSE 3
        END ASC
    ")
    ->orderBy('masterdata.book_name', 'ASC')
    ->offset($start)
    ->limit($length)
    ->get();

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    $userIds = $masterDataList
        ->pluck('user_id')
        ->filter()
        ->unique()
        ->toArray();

    $users = DB::table('users')
        ->whereIn('id', $userIds)
        ->get()
        ->keyBy('id');

    /*
    |--------------------------------------------------------------------------
    | Combine Parent + Child Records
    |--------------------------------------------------------------------------
    */

    $combinedData = [];

    foreach ($masterDataList as $parent) {
        $combinedData[] = $parent;      
    }

    /*
    |--------------------------------------------------------------------------
    | Format Data
    |--------------------------------------------------------------------------
    */

    $combinedData = collect($combinedData)->map(function ($data) use (
        $users,
        $fromMasterID,
        $toMasterID
    ) {

        // Created By
        if (
            isset($data->user_id) &&
            isset($users[$data->user_id])
        ) {

            $user = $users[$data->user_id];

            $data->createdBy =
                ($user->name ?? '') . ' ' . ($user->last_name ?? '');

        } else {

            $data->createdBy = '';
        }

        // Date Format
        if (isset($data->created_date) && $data->created_date) {

            $data->created_date =
                Carbon::parse($data->created_date)
                ->format('d-m-Y H:i:s');
        }

        // Compare Text
        $data->master_compare =
            $fromMasterID . ' → ' . $toMasterID;

        return $data;
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return response()->json([
        'draw' => intval($draw),
        'recordsTotal' => $totalRecored,
        'recordsFiltered' => $totalRecored,
        'data' => $combinedData,
    ]);
}

}