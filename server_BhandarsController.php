<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\MasterData;
use App\Models\BhandarData;
use App\Helpers\BhandarHelper;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Auth;
use DB;
class BhandarsController extends Controller
{
     public function __construct()
    {    
     // $this->middleware('auth');
    }

    public function index(){
      return view('backend.dashboard.adminbackend.bhandar.index');
    }
    public function add_bhandar(){
      return view('backend.dashboard.adminbackend.bhandar.add_bhandar');
    }    

    public function store_bhandar(Request $request)
    {
        $validate = Validator::make($request->all(),[
            'sname' => 'required',
            'city' => 'required',
            'bhandar_code' => 'required',
        ]);

        if($validate->fails()){
            return redirect()->back()->withErrors($validate->Errors());
        }
        $bhandar_id = DB::table('backend_bhandar')
            ->where('bhandar_code', $request->bhandar_code)->exists();
        $bhandar_name = DB::table('backend_bhandar')
            ->where('sname', $request->sname)
            ->where('city', $request->city)->exists();
        // dd($bhandar_name);
        if($bhandar_name || $bhandar_id){
            return redirect()->back()->withErrors([
                'bhandar_code' => $bhandar_id ? 'Bhandar with this Bhandar Code already exists.' : '',
                'sname' => $bhandar_name ? 'Bhandar with this Sname and City already exists.' : '',
            ])->withInput();
        }
        
        // Insert the new Bhandar
        $bhandar = DB::table('backend_bhandar')->insert([

            'bhandar_code' => $request->bhandar_code,
            'sname' => $request->sname,
            'name' => $request->name,
            'contact' => $request->contact,
            'mobile' => $request->mobile,
            'email' => $request->email,
            'area' => $request->area,
            'city' => $request->city,
            'state' => $request->state,
            'timing' => $request->timing,
            'address' => $request->address,
            'notes' => $request->notes,
            'separator' => $request->separator,
            'country' => $request->country,
        ]);

        if ($bhandar) {
            if ($request->has('_addanother')) {
                return redirect()->route('add_bhandar')->with('success', 'Bhandar “' . $request->sname . ":" . $request->city . '” was added successfully. You may add another Bhandar below.');
            }elseif ($request->has('_continue')) {
                return redirect()->route('change_bhandar', ['bhandar_code' => $request->bhandar_code])->with('success', 'Bhandar “' . $request->sname . ":" . $request->city . '” was added successfully. You may edit it again below.');
            }elseif ($request->has('popup')) {
                // Assuming there's popup add page
                return redirect()->back()
                ->with('success', 'Bhandar added successfully!')
                ->with('bhandar_id', $request->bhandar_code);
            } else {
                return redirect()->route('bhandar')->with('success', 'The Bhandar “' . $request->sname . ":" . $request->city . '” was added successfully.');
            }
        } else {
            return redirect()->back()->withInput()->with('error', 'Failed to add Bhandar. Please try again.');
        }
    }

    public function change_bhandar_by_id(Request $request)
    {
        $bhandar = DB::table('backend_bhandar')
            ->where('bhandar_code', $request->bhandar_code)
            ->get();  
            
        if (count($bhandar) > 0){    
            return view('backend.dashboard.adminbackend.bhandar.change', ['bhandar' => $bhandar[0]]);
        }  
        else{
            return redirect()->route('admin.dashboard')->with('warning', 'Bhandar with ID "'.$request->bhandar_code.'" doesn’t exist. Perhaps it was deleted?');        
        }  
    }

    public function update_bhandar(Request $request, $id)
    {
        try {
            $validate = Validator::make($request->all(),[
                'sname' => 'required',
                'city' => 'required',
                'bhandar_code' => 'required'
            ]);
    
            if($validate->fails()){
                return redirect()->back()->withErrors($validate->Errors());
            }

            $bhandarData = [
                'bhandar_code' => $request->bhandar_code,
                'sname' => $request->sname,
                'name' => $request->name,
                'contact' => $request->contact,
                'mobile' => $request->mobile,
                'email' => $request->email,
                'area' => $request->area,
                'city' => $request->city,
                'state' => $request->state,
                'timing' => $request->timing,
                'address' => $request->address,
                'notes' => $request->notes,
                'separator' => $request->separator,
                'country' => $request->country,
            ];

            // dd('bhandarData', $bhandarData);
            $bhandar_id = DB::table('backend_bhandar')
                ->where('bhandar_code', $request->bhandar_code)->exists();
            $bhandar_name = DB::table('backend_bhandar')
                ->where('sname', $request->sname)
                ->where('city', $request->city)->exists(); 

            if ($request->has('_saveasnew')) {
                if($bhandar_name || $bhandar_id){
                    return redirect()->back()
                    ->withErrors([
                        'bhandar_code' => $bhandar_id ? 'Bhandar with this Bhandar Code already exists.' : '',
                        'sname' => $bhandar_name ? 'Bhandar with this Sname and City already exists.' : '',
                        'saveasnew' => 'saveasnew',
                    ])->withInput();                    
                } else {                    
                    $new_bhandar = DB::table('backend_bhandar')->insert($bhandarData);
                    return redirect()->route('change_bhandar', ['bhandar_code' => $request->bhandar_code])->with('success', 'The Bhandar “' . $request->sname . ":" . $request->city . '” was added successfully.  You may edit it again below.');
                }                
            } 
            elseif($request->has('popup')){
                if($id == $request->bhandar_code){
                    $bhandar = DB::table('backend_bhandar')->where('bhandar_code', $id)->update($bhandarData);
                } else{
                    if($bhandar_name || $bhandar_id){
                        return redirect()->back()
                        ->withErrors([
                            'bhandar_code' => $bhandar_id ? 'Bhandar with this bhandar code already exists.' : '',
                            'sname' => $bhandar_name ? 'Bhandar with this Sname and City already exists.' : '',
                            'saveasnew' => 'saveasnew',
                        ])->withInput();                    
                    } else {                    
                        $new_bhandar = DB::table('backend_bhandar')->insert($bhandarData);
                    }  
                }
                return redirect()->back()
                ->with('success', 'Bhandar changed successfully!')
                ->with('bhandar_id', $request->bhandar_code);
            } 
            else{
                $bhandar = DB::table('backend_bhandar')->where('bhandar_code', $id)->update($bhandarData);
                
                if ($request->has('_continue')) {
                    return redirect()->route('change_bhandar', ['bhandar_code' => $id])->with('success', 'The Bhandar “' . $request->sname . ":" . $request->city . '” was changed successfully. You may edit it again below.');
                } else {
                    return redirect()->route('bhandar')->with('success', 'The Bhandar “' . $request->sname . ":" . $request->city . '” was changed successfully.');
                }
            }
        } catch (\Exception $e) {      
            echo "<pre>"; print_r($e->getMessage()); echo "<pre>"; 
            exit;  
            return redirect()->route('bhandar')->with('error', 'Whoops! Something went wrong while updating Bhandar!');
        }
    }

    public function history($id){
        $bhandar = DB::table('backend_bhandar')
          ->where('bhandar_code', $id)
          ->get();
        return view('backend.dashboard.adminbackend.bhandar.history', ['bhandar' => $bhandar]);
    } 

    public function popup_bhandar(){
      return view('backend.dashboard.adminbackend.bhandar.popup');
    }

    public function change_bhandar_popup(Request $request)
    {
        $bhandar = DB::table('backend_bhandar')
            ->where('bhandar_code', $request->bhandar_code)
            ->first(); // Use first() to retrieve a single model instance
        
        // Check if $bhandar is not null
        if ($bhandar) {
            return view('backend.dashboard.adminbackend.bhandar.change_bhandar_popup', ['bhandar' => $bhandar]);
        } else {
            return redirect()->back()->with('error', 'Bhandar not found');
        }
    }

    public function confirm_bhandar(Request $request)
    {      
        $bhandar_ids = $request->input('bhandar_id');        
        $bhandars = DB::table('backend_bhandar')
            ->whereIn('bhandar_code', $bhandar_ids)
            ->select(['bhandar_code', 'sname', 'city'])
            ->get();

        $tables = ['backend_booksize', 'backend_language', 'backend_member', 'BhandarData', 'backend_deletedbook', 'backend_bookissuehistory', 'backend_adminuser_bhandars', 'backend_appsettings']; 
        $data = [];
        $count = [];

        foreach ($tables as $table) {
            $data[$table] = DB::table($table);
            if($table == 'BhandarData' || $table == 'backend_deletedbook'){
                $data[$table]->whereIn('bhandar_code', $bhandar_ids)->get(['bhandar_code as bhandar_id']);
            } else{
                $data[$table]->whereIn('bhandar_id', $bhandar_ids)->get(['bhandar_id']);
            }           
            // Count the number of rows
            $count[$table] = $data[$table]->count();
        }        
        // dd($data, $count);        

        // Define related data configuration
        $related_data = [
            'Book size' => ['backend_booksize', ['id', 'size as name']],
            'Languages' => ['backend_language', ['id', 'name']],
            'Members' => ['backend_member', ['mid as id', 'name']],
            'Books' => ['BhandarData', ['SSID as id', 'book_name as name']],
            'Deleted books' => ['backend_deletedbook', ['id','book_name as name']],
            'Book issue historys' => ['backend_bookissuehistory', ['id', 'issued_to_id as name']],
        ];
        // Initialize an empty array to store related data for each Bhandar ID
        $bhandar_related_data = [];
        
        // Fetch related data for each Bhandar ID
        foreach ($bhandar_ids as $bhandar_id) {
            $bhandar_related_data[$bhandar_id] = [];
            
            foreach ($related_data as $label => $config) {
                list($table, $columns) = $config;                
                // Fetch related data for the current Bhandar ID from the specified table
                $related_data_for_bhandar = DB::table($table);
                if($table == 'BhandarData' || $table == 'backend_deletedbook'){
                    $related_data_for_bhandar->where('bhandar_code', $bhandar_id)->select($columns);
                } else{               
                    $related_data_for_bhandar->where('bhandar_id', $bhandar_id)->select($columns);
                }             
                // Store the fetched related data in the array
                $bhandar_related_data[$bhandar_id][$label] = $related_data_for_bhandar->get();
            }
        }
        // dd($bhandar_related_data);
        $bhandar_summary = [
            'Bhandars' => count($bhandars),
            'Adminuser-bhandar relationships' => $count['backend_adminuser_bhandars'],
            'App settings' => $count['backend_appsettings'],
            'Book sizes' => $count['backend_booksize'],
            'Languages' => $count['backend_language'],
            'Members' => $count['backend_member'],
            'Books' => $count['BhandarData'],
            'Deleted books' => $count['backend_deletedbook'],
            'Book issue historys' => $count['backend_bookissuehistory']
        ];
        // dd($bhandar_summary, $count);  
        $breadcrumbs = [
            ['url' => route('adminbackend'), 'label' => 'Backend'],
            ['url' => route('bhandar'), 'label' => 'Bhandars'],
            ['url' => '#', 'label' => 'Delete multiple objects']
        ];

        $data = [
            'type' => 'bhandar',
            'breadcrumbs' => $breadcrumbs,
            'summarys' => $bhandar_summary,
            'bhandars' => $bhandars, 
            'bhandar_related_data' => $bhandar_related_data, 
            'action_url' => route('delete_bhandar'),           
            'del_ids' => $bhandars->pluck('bhandar_code'),
        ];

        return view('backend.dashboard.comm_confirm_msgs', $data);
    }

    public function delete_bhandar(Request $request)
    {
        $error = null;
        $success = null;
        $delBhandarsList = [];
        $data = null;
        $tables = ['backend_booksize', 'backend_language', 'backend_member', 'BhandarData', 'backend_deletedbook', 'backend_bookissuehistory', 'backend_appsettings'];
    
        try {
            $bhandar_ids = $request->input('del_ids');
            $bhandars = DB::table('backend_bhandar')->whereIn('bhandar_code', $bhandar_ids)->get();
    
            foreach ($bhandars as $bhandar) {
                DB::transaction(function () use ($bhandar, &$delBhandarsList, &$tables) {
                    $delBhandarsList[] = $bhandar->sname.':'.$bhandar->city;
                    // First, delete related records in backend_deletedbook
                    foreach ($tables as $table) {
                        $data = DB::table($table);
                        if($table == 'BhandarData' || $table == 'backend_deletedbook' ){
                            $data->where('bhandar_code', $bhandar->bhandar_code);
                        }else{
                            $data->where('bhandar_id', $bhandar->bhandar_code);
                        }
                        $data->delete();
                    }
                    // Then, delete the record in backend_bhandar
                    DB::table('backend_bhandar')->where('bhandar_code', $bhandar->bhandar_code)->delete();
                });
            }
        } catch (\Exception $e) {
            $error = "Error occurred while deleting bhandar! Reason: " . $e->getMessage();
        }
    
        if (!$error) {
            if (!empty($delBhandarsList)) {
                if (count($delBhandarsList) == 1) {
                    $success = 'The bhandar  "' . $delBhandarsList[0] . '"  was deleted successfully.';
                } else {
                    $success = 'Successfully deleted ' . count($delBhandarsList) . ' bhandars.';
                }
                $error = null;
            }
        }
    
        if ($error) {
            return redirect()->route('bhandar')->with(['error' => $error], 400);
        } else {
            return redirect()->route('bhandar')->with(['success' => $success]);           
        }
    }
    

    public function get_bhandars_list(Request $request)
    {        
        $length = $request->input('length', 40);
        $start = $request->input('start', 0); 
        $draw = $request->input('draw', 1);
        $userId = $request->input('userId', 1); // Get the logged-in user ID
        $isAdmin = $request->input('usertype', 1); // Check if the user is an admin

        $search = $request->input('search_value', '');

        // Base query for counting records
        $queryCount = DB::table('backend_bhandar');

        // Base query for fetching data
        $queryLists = DB::table('backend_bhandar')
                        ->orderBy('sname');

        // Filter by user ID if not an admin
        if (!$isAdmin) {
            $queryCount->join('backend_adminuser_bhandars', 'backend_bhandar.bhandar_code', '=', 'backend_adminuser_bhandars.bhandar_id')
                    ->where('backend_adminuser_bhandars.adminuser_id', $userId);

            $queryLists->join('backend_adminuser_bhandars', 'backend_bhandar.bhandar_code', '=', 'backend_adminuser_bhandars.bhandar_id')
                    ->where('backend_adminuser_bhandars.adminuser_id', $userId);
        }

        if ($length != -1) {
            $queryLists->limit($length)->offset($start);
        }

        if (!empty($search)) {
            $queryCount->whereRaw("(bhandar_code LIKE ? OR sname LIKE ? OR name LIKE ? OR mobile LIKE ? OR contact LIKE ? OR area LIKE ? OR city LIKE ? OR address LIKE ? OR state LIKE ?)",array('%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%'));
            $queryLists->whereRaw("(bhandar_code LIKE ? OR sname LIKE ? OR name LIKE ? OR mobile LIKE ? OR contact LIKE ? OR area LIKE ? OR city LIKE ? OR address LIKE ? OR state LIKE ?)",array('%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%', '%'.$search.'%'));
        }  
        
        $bhandars = $queryLists->get(['bhandar_code','sname','name','contact','mobile','email','area','city','address','state']);
        
        $totalRecords = $queryCount->count();
        
        return json_encode([
            'draw' => $draw,
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $totalRecords,
            'data' => $bhandars,
        ]); 
    }


    // for front-side bhandar dropdown view
    public function view_bhandar_dropdown(){
        $bhandar = DB::table('backend_bhandar')->get();
        dd($bhandar);
        return view('layouts.frontend', compact('bhandar'));
      //  return view('frontend.bhandar_dropdown',compact('bhandar'));
    }

    function get_bhandar_dropdown()
    {
        $bhandar_data = DB::table('backend_bhandar')
            ->get(['bhandar_code','sname','city']);

        return json_encode([
            'status' => true,
            'message' => 'bhandar dropdwon!',
            'data' => $bhandar_data,
        ]);

    }
    function get_city_dropdown()
    {
        $bhandar_code = BhandarHelper::getBhandarId($request = '');

        $cities = DB::table('backend_bhandar')
            ->select('city')
            ->distinct()
            ->orderBy('city', 'asc')
            ->get()
            ->toArray();
         
        return json_encode([
            'status' => true,
            'message' => 'city dropdwon!',
            'data' => $cities,
        ]);

    }

    public function import_bhandar(){
        return view('backend.dashboard.adminbackend.bhandar.import');
    }
    
    public function import_bdformat(Request $request)
    {
        $request->validate([
            'import_file' => 'required', 
            'input_format' => 'required|in:0,1,2,3,4,5',
        ]);

        // Read file and skip data
        $file = $request->file('import_file');
        $selectedFormat = $request->input('input_format');

        // Mapping of input format values to file extensions
        $formatExtensions = [
            0 => 'xlsx',
        ];

        // Get the file extension
        $fileExtension = strtolower($file->getClientOriginalExtension());

        // Compare the file extension with the selected format extension
        if ($fileExtension !== $formatExtensions[$selectedFormat]) {
            return redirect()->back()->with('error', 'Selected format does not match the file extension. Please select the correct format.');
        }

        // Process the file
        $handle = fopen($file->path(), 'r');

        // Skip the header row
        fgetcsv($handle);

        $bhandarSize = 25; // Default batch size
        $totalRows = count(file($file->path())); // Count total rows in the file

        while (!feof($handle)) {
            $bhandarData = []; 

            // Calculate the batch size based on remaining rows
            $batchSize = min($bhandarSize, $totalRows);

            for ($i =0; $i < $batchSize; $i++) {
                $data = fgetcsv($handle);
                if ($data === false) {
                    break;
                }
                $bhandarData[] = $data;
            }
            
            // Update total rows
            $totalRows -= $batchSize;
            // dd($batchSize);

            $this->processBhandarData($bhandarData); 
        }

        fclose($handle);

        return redirect()->back()->with('success', 'Data has been imported successfully.');
    }


    public function processBhandarData($bhandarData)
    {
        foreach ($bhandarData as $column) {
            // Extracting data from each column
            $bhandar_code = isset($column[0]) ? $column[0] : null;
            $sname = isset($column[1]) ? $column[1] : null;
            $name = isset($column[2]) ? $column[2] : null;
            $contact = isset($column[3]) ? $column[3] : null;
            $mobile = isset($column[4]) ? $column[4] : null;
            $email = isset($column[5]) ? $column[5] : null;
            $area = isset($column[6]) ? $column[6] : null;
            $city = isset($column[7]) ? $column[7] : null;
            $state = isset($column[8]) ? $column[8] : null;
            $timing = isset($column[9]) ? $column[9] : null;
            $address = isset($column[10]) ? $column[10] : null;
            $notes = isset($column[11]) ? $column[11] : null;
            $separator = isset($column[12]) ? $column[12] : null;
            $created = isset($column[13]) ? $column[13] : null;
            $modified = isset($column[14]) ? $column[14] : null;
            $country = isset($column[15]) ? $column[15] : null;

            $bhandar = DB::table('backend_bhandar')->insert([
                'bhandar_code' => $bhandar_code,
                'sname' => $sname,
                'name' => $name,
                'contact' => $contact,
                'mobile' => $mobile,
                'email' => $email,
                'area' => $area,
                'city' => $city,
                'state' => $state,
                'timing' => $timing,
                'address' => $address,
                'notes' => $notes,
                'separator' => $separator,
                'country' => $country,
            ]);
        }

    }
    public function export_bhandar(){
        return view('backend.dashboard.adminbackend.bhandar.export');
    }
    public function export_bdformat(Request $request)
    {
        $fileFormat = $request->input('file_format');
       
        // Fetch data from your database here
        $bhandars = DB::table('backend_bhandar')->get();

        // Generate export file based on the selected format
        switch ($fileFormat) {
            case 'csv':
                return $this->exportToCSV($bhandars);
                break;
            case 'xls':
                return $this->exportToXLS($bhandars);
                break;
            case 'xlsx':
                return $this->exportToXLSX($bhandars);
                break;
            case 'tsv':
                return $this->exportToTSV($bhandars);
                break;
            case 'ods':
                return $this->exportToODS($bhandars);
                break;
            case 'json':
                return $this->exportToJSON($bhandars);
                break;
            case 'yaml':
                return $this->exportToYAML($bhandars);
                break;
            case 'html':
                return $this->exportToHTML($bhandars);
                break;
            
            default:
                return redirect()->route('export_bhandar')->with('error', 'Invalid file format selected');
        }
    }
    private function exportToCSV($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.csv";

        // Set headers for csv
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
    
        // Create a file pointer connected to PHP output
        $output = fopen('php://output', 'w');
    
        // Write header row
        fputcsv($output, [
            'bhandar_code','sname','name','contact','mobile','email','area','city','state','timing','address','notes','separator','created','modified','country',], "\t");
    
        // Write data rows
        foreach ($data as $bhandar) {
            fputcsv($output, [
                $bhandar->bhandar_code ?? '',
                $bhandar->sname ?? '',
                $bhandar->name ?? '',
                $bhandar->contact ?? '',
                $bhandar->mobile ?? '',
                $bhandar->email ?? '',
                $bhandar->area ?? '',
                $bhandar->city ?? '',
                $bhandar->state ?? '',
                $bhandar->timing ?? '',
                $bhandar->address ?? '',
                $bhandar->notes ?? '',
                $bhandar->separator ?? '',
                $bhandar->created ?? '',
                $bhandar->modified ?? '',
                $bhandar->country ?? ''
            ], "\t");
        }
        // Terminate script
        exit;
    }
    private function exportToXLS($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.xls";

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $output = fopen('php://output', 'w');

        fputcsv($output, [
            'bhandar_code','sname','name','contact','mobile','email','area','city','state','timing','address','notes','separator','created','modified','country',], "\t");

        foreach ($data as $bhandar) {
            fputcsv($output, [
                $bhandar->bhandar_code ?? '',
                $bhandar->sname ?? '',
                $bhandar->name ?? '',
                $bhandar->contact ?? '',
                $bhandar->mobile ?? '',
                $bhandar->email ?? '',
                $bhandar->area ?? '',
                $bhandar->city ?? '',
                $bhandar->state ?? '',
                $bhandar->timing ?? '',
                $bhandar->address ?? '',
                $bhandar->notes ?? '',
                $bhandar->separator ?? '',
                $bhandar->created ?? '',
                $bhandar->modified ?? '',
                $bhandar->country ?? ''
            ], "\t");
        }
        exit;
    }
    private function exportToXLSX($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.xlsx";

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $output = fopen('php://output', 'w');

        fputcsv($output, [
            'bhandar_code', 'sname', 'name', 'contact', 'mobile', 'email', 'area', 'city', 'state', 'timing', 'address', 'notes', 'separator', 'created', 'modified', 'country'], "\t");

        foreach ($data as $bhandar) {
            fputcsv($output, [
                $bhandar->bhandar_code ?? '',
                $bhandar->sname ?? '',
                $bhandar->name ?? '',
                $bhandar->contact ?? '',
                $bhandar->mobile ?? '',
                $bhandar->email ?? '',
                $bhandar->area ?? '',
                $bhandar->city ?? '',
                $bhandar->state ?? '',
                $bhandar->timing ?? '',
                $bhandar->address ?? '',
                $bhandar->notes ?? '',
                $bhandar->separator ?? '',
                $bhandar->created ?? '',
                $bhandar->modified ?? '',
                $bhandar->country ?? ''
            ], "\t");
        }

        fclose($output);
        exit;
    }
    private function exportToTSV($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.tsv"; 
        
        header('Content-Type: text/tab-separated-values');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $output = fopen('php://output', 'w');

        fwrite($output, implode("\t", [
            'bhandar_code', 'sname', 'name', 'contact', 'mobile', 'email', 'area', 'city', 'state', 'timing', 'address', 'notes', 'separator', 'created', 'modified', 'country'
        ]) . "\n");

        foreach ($data as $bhandar) {
            fwrite($output, implode("\t", [
                $bhandar->bhandar_code ?? '',
                $bhandar->sname ?? '',
                $bhandar->name ?? '',
                $bhandar->contact ?? '',
                $bhandar->mobile ?? '',
                $bhandar->email ?? '',
                $bhandar->area ?? '',
                $bhandar->city ?? '',
                $bhandar->state ?? '',
                $bhandar->timing ?? '',
                $bhandar->address ?? '',
                $bhandar->notes ?? '',
                $bhandar->separator ?? '',
                $bhandar->created ?? '',
                $bhandar->modified ?? '',
                $bhandar->country ?? ''
            ]) . "\n");
        }
        fclose($output);
        exit;
    }
    private function exportToODS($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.ods"; 

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $output = fopen('php://output', 'w');

        fputcsv($output, [
            'bhandar_code','sname','name','contact','mobile','email','area','city','state','timing','address','notes','separator','created','modified','country',], "\t");

        foreach ($data as $bhandar) {
            fputcsv($output, [
                $bhandar->bhandar_code ?? '',
                $bhandar->sname ?? '',
                $bhandar->name ?? '',
                $bhandar->contact ?? '',
                $bhandar->mobile ?? '',
                $bhandar->email ?? '',
                $bhandar->area ?? '',
                $bhandar->city ?? '',
                $bhandar->state ?? '',
                $bhandar->timing ?? '',
                $bhandar->address ?? '',
                $bhandar->notes ?? '',
                $bhandar->separator ?? '',
                $bhandar->created ?? '',
                $bhandar->modified ?? '',
                $bhandar->country ?? ''
            ], "\t");
        }
        exit;
    }
    private function exportToJSON($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.json";

        header('Content-Type: application/json');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $json = json_encode($data);

        echo $json;
        exit;
    }

    private function exportToYAML($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.yaml";

        header('Content-Type: application/json');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $json = json_encode($data);

        echo $json;
        exit;
    }
    private function exportToHTML($data)
    {
        $currentDate = date('Y-m-d');
        $filename = "Bhandar-$currentDate.html";

        header('Content-Type: text/html');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $html = '<table>';
        $html .= '<tr><th>bhandar_code</th><th>sname</th><th>name</th><th>contact</th><th>mobile</th><th>email</th><th>area</th><th>city</th><th>state</th><th>timing</th><th>address</th><th>notes</th><th>separator</th><th>created</th><th>modified</th><th>country</th></tr>';

        foreach ($data as $bhandar) {
            $html .= '<tr>';
            $html .= '<td>' . ($bhandar->bhandar_code ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->sname ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->name ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->contact ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->mobile ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->email ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->area ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->city ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->state ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->timing ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->address ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->notes ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->separator ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->created ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->modified ?? '') . '</td>';
            $html .= '<td>' . ($bhandar->country ?? '') . '</td>';
            $html .= '</tr>';
        }

        $html .= '</table>';

        echo $html;
        exit;
    }

    // importing Bhandar data in BhandarData table  
   
    private function sanitizeString($value)
    {
        return !empty($value) ? trim($value) : null;
    }
    private function sanitizeInt($value)
    {
        return is_numeric($value) ? (int)$value : null;
    }
}
