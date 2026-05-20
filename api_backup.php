<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Frontend\FrontendBooksController;
use App\Http\Controllers\Frontend\QuickAdvanceSearchController;
use App\Http\Controllers\Admin\BhandarDataController;
use App\Http\Controllers\API\MasterDataController;
use App\Http\Controllers\Admin\UnmapBhandarDataController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/




/* FrontendMemberController API Routes */
Route::get('/front/memberHistory_list', [App\Http\Controllers\Frontend\FrontendMemberController::class, 'get_memberHistory_list']);
Route::post('/front/update_member', [App\Http\Controllers\Frontend\FrontendMemberController::class, 'update_member']);
Route::post('/front/add_member', [App\Http\Controllers\Frontend\FrontendMemberController::class, 'add_member']);
Route::post('/front/delete_member', [App\Http\Controllers\Frontend\FrontendMemberController::class, 'delete_member']);

/* FrontendBooksSizeController API Routes */
Route::get('/front/booksize_list', [App\Http\Controllers\Frontend\FrontendBooksSizeController::class, 'get_bookSize_list']);
Route::post('/front/add_booksize', [App\Http\Controllers\Frontend\FrontendBooksSizeController::class, 'addBookSize']);

Route::get('/front/title-autocomplete', [App\Http\Controllers\Frontend\TitleAutocompleteController::class, 'title_autocomplete'])->name('title-autocomplete');
/* FrontendBooksController API Routes */
Route::post('/front/add_book', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'add_book'])->name('add.book');  
Route::get('/front/topic-autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'topicAutocomplete']);
Route::get('/front/publisher-autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'publisherAutocomplete']);
Route::get('/front/perticular-autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'perticularAutocomplete']);
Route::get('/front/editor-autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'editorAutocomplete']);
Route::get('/front/author_autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'authorAutocomplete'] );
Route::get('/front/lang_autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'languageAutocomplete'] );
Route::get('/front/yeartype_autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'yeartypeAutocomplete'] );
Route::get('/front/size_autocomplete', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'sizeAutocomplete'] );
Route::post('/returnbooks', [FrontendBooksController::class, 'returnBooks'])->name('front.returnbooks');

/* QuickAdvanceSearchController API Routes */
Route::get('/front/booknumber_popup', [QuickAdvanceSearchController::class, 'bookNumber_popup'])->name("booknumber.popup"); 
Route::post('/front/quick_search_delete', [QuickAdvanceSearchController::class, 'quickSearch_delete']);


Route::post('master_data_update', [App\Http\Controllers\Admin\MasterDataController::class, 'jainam_masterData_update']);
Route::post('/update_approved_data', [App\Http\Controllers\Admin\MasterDataController::class, 'update_approved_masterData']);
Route::post('/reject_changes', [App\Http\Controllers\Admin\MasterDataController::class, 'rejected_masterData']);
Route::get('/check_kruti_mismatched_data', [App\Http\Controllers\Admin\MasterDataController::class, 'check_kruti_mismatched_data']);

Route::post('/delete_bhandar_data', [App\Http\Controllers\Admin\BhandarDataController::class, 'delete_bhandar_data']);

Route::get('/export-books', [App\Http\Controllers\Admin\BookController::class, 'export_books']);
Route::get('/download_excel', [App\Http\Controllers\Frontend\FrontendExportController::class, 'exportUsersXls']);
Route::post('/export-bhandardata', [App\Http\Controllers\Admin\BhandarDataController::class, 'exportBhandarData'])->name('exportBhandarData');
Route::post('/export-masterdata-format', [App\Http\Controllers\Admin\MasterDataController::class, 'exportSelectedData'])->name('export_selected_data');
Route::post('/import-bhandardata', [BhandarDataController::class, 'import_bhandardata_format']);
Route::post('/get-masterdata', [App\Http\Controllers\API\MasterDataController::class, 'get_masterdata']);
Route::post('/map_matching_bhandar_data', [UnmapBhandarDataController::class, 'mapMatchingBhandarData'])->name('map_matching_bhandar_data');
Route::get('/get_index_search_api', [App\Http\Controllers\Frontend\IndexSearchController::class, 'getIndexSearchAPI']);
