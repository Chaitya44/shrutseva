<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\BookController;
use App\Http\Controllers\Admin\KrutiController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\BookSizeController;
use App\Http\Controllers\Admin\BhandarsController;
use App\Http\Controllers\Admin\BhandarDataController;
use App\Http\Controllers\Admin\UnmapBhandarDataController;
use App\Http\Controllers\Admin\LanguageController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\AuthGroupController;
use App\Http\Controllers\Admin\AppSettingController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\BulkuploadController;
use App\Http\Controllers\Admin\BackendAuthController;
use App\Http\Controllers\Admin\DeletedBookController;
use App\Http\Controllers\Admin\BookIssueHistoryController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Frontend\DashboardController;
use App\Http\Controllers\Frontend\FrontendBooksController;
use App\Http\Controllers\Frontend\FrontendMemberController;
use App\Http\Controllers\Frontend\TitleAutocompleteController;
use App\Http\Controllers\Frontend\QuickAdvanceSearchController;
use App\Http\Controllers\Frontend\QuickAdvanceHindiSearchController;
use App\Http\Controllers\Frontend\FrontendDeletedBooksController;
use App\Http\Controllers\Frontend\FrontendImportController;
use App\Http\Controllers\Frontend\FrontendExportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/test-simple-string', function() {
    return 'Hello World!';
});

Route::get('/test-dashboard-controller', function() {
    return class_exists('App\Http\Controllers\Frontend\DashboardController') ? 'Yes, exists!' : 'No, does not exist!';
});

Route::get('/under-construction', function () {
    return view('under-construction');
})->name('under-construction');
/*Route::get('/', function () {
    return view('under-construction');
})->name('under-construction');/


/* FRONTEND ROUTES */
// Unauthenticated Frontent view routes
Route::get('/', [FrontendController::class, 'index']);

Route::get('/accounts/changepassword/', [FrontendController::class,'changepassword'])->name('accounts.changepassword');
Route::get('/quicksearchbooks', [FrontendController::class, 'quick_search_books'])->name('quickSearch');
Route::get('/quickhindisearchbooks', [FrontendController::class, 'quick_hindi_search_books'])->name('quickHindiSearch');
Route::get('/quicksearchbooks_v2', [FrontendController::class, 'quick_search_books_v2'])->name('quickSearch_v2');
Route::get('/accounts/login', [FrontendController::class, 'accounts_login'])->name('accounts.login');
Route::get('/add-bhandar', [FrontendController::class, 'bhandaradd'])->name('front.bhandaradd');
Route::get('/bhandars', [FrontendController::class, 'bhandars'])->name('front.bhandars');
Route::get('/advsearchbooks', [FrontendController::class, 'adv_search_books'])->name('front.adv_search_books');;
Route::get('/advhindisearchbooks', [FrontendController::class, 'adv_hindi_search_books'])->name('front.adv_hindi_search_books');
Route::get('/indexsearch', [FrontendController::class, 'indexsearch'])->name('front.indexsearch');
Route::get('/index-search', [FrontendController::class, 'newindexsearch'])->name('front.index-search');
Route::get('/front/get_index_search_data', [App\Http\Controllers\Frontend\IndexSearchController::class, 'getIndexSearchData']);


Route::post('change_password', [ResetPasswordController::class, 'changePassword'])->name('change_password');


// Route::post('/front/add_book', [FrontendBooksController::class, 'add_book'])->name('add.book')->middleware('cors');  

Route::get('/view-book', [FrontendBooksController::class, 'viewBook'])->name('front.viewBook');
Route::get('/add-book', [FrontendBooksController::class, 'addbook'])->name('addbook');
// Route::post('/front/add_book', [App\Http\Controllers\Frontend\FrontendBooksController::class, 'add_book'])->name('add.book');  


/* Autocomplete Route */
Route::get('/publisher-autocomplete', [FrontendBooksController::class, 'publisherAutocomplete']);
Route::get('/editor-autocomplete', [FrontendBooksController::class, 'editorAutocomplete']);
Route::get('/topic-autocomplete', [FrontendBooksController::class, 'topicAutocomplete']);
Route::get('/title-autocomplete', [TitleAutocompleteController::class, 'title_autocomplete'])->name('title-autocomplete');

Route::get('/front/quick_advance_book_search', [QuickAdvanceSearchController::class, 'quick_advance_book_search']); 
Route::get('/front/bhandar_book_search', [QuickAdvanceSearchController::class, 'bhandar_book_search']); 
Route::get('/front/quick_book_search', [QuickAdvanceSearchController::class, 'quick_book_search']);
Route::get('/front/quick_hindi_book_search', [QuickAdvanceHindiSearchController::class, 'quick_hindi_book_search']);
Route::get('/front/quick_book_details', [QuickAdvanceSearchController::class, 'quick_book_details']);
Route::get('/front/quick_hindi_book_details', [QuickAdvanceHindiSearchController::class, 'quick_hindi_book_details']);
Route::get('/front/quick_advance_hindi_book_search', [QuickAdvanceHindiSearchController::class, 'quick_advance_book_search']);
Route::get('/front/bhandar_hindi_book_search', [QuickAdvanceHindiSearchController::class, 'bhandar_book_search']);
Route::get('/front/quick_book_search_v2', [QuickAdvanceSearchController::class, 'quick_book_search_v2']);

Route::get('/front/get_book_details', [QuickAdvanceSearchController::class, 'get_book_details']);

/* Unauthenticated API */
Route::get('/get_bhandars_list', [BhandarsController::class, 'get_bhandars_list'])->name('get_bhandars_list');
Route::get('/front/bhandars_city_dropdown', [BhandarsController::class, 'get_city_dropdown'])->name('bhandars_city_dropdown');
Route::get('/front/dashboard_stats', [App\Http\Controllers\Frontend\DashboardController::class, 'apiDashboardStats']);
Route::get('/front/master_data_list', [App\Http\Controllers\Frontend\DashboardController::class, 'apiMasterDataList']);


/* BACKEND ROUTES */
Route::get('/admin/login', [BackendAuthController::class, 'showLoginForm'])->name('back.login');

/* AUTHENTICATION ROUTES */

Auth::routes();
Route::get('/admin/get_unmapped_matching_list', [UnmapBhandarDataController::class, 'get_unmapped_matching_list'])->name('get_unmapped_matching_list');

Route::group(['middleware' => ['isAdmin','auth']], function(){

    /* -------------- FRONTEND ROUTES -------------- */
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('front.dash');
    Route::get('/import-book', [FrontendController::class, 'importbook'])->name('front.importbook');
    Route::get('/export-book', [FrontendController::class, 'exportbook'])->name('front.exportbook');
    Route::get('/deleted-book', [FrontendController::class, 'deletedbook'])->name('front.deletedbook');
    Route::get('/issued-book', [FrontendController::class, 'issuedbook'])->name('front.issuedbook');
    Route::get('/book-history', [FrontendController::class, 'bookhistory'])->name('front.bookhistory');   
    Route::get('/member-history', [FrontendController::class, 'memberhistory'])->name('front.memberhistory');
    Route::get('/history-search', [FrontendController::class, 'historysearch'])->name('front.historysearch');
    Route::get('/missing-book', [FrontendController::class, 'missingbook'])->name('front.missingbook');
    Route::get('/created-book', [FrontendController::class, 'createdbook'])->name('front.createdbook');
    Route::get('/modified-book', [FrontendController::class, 'modifiedbook'])->name('front.modifiedbook');
    Route::get('/subject', [FrontendController::class, 'subject'])->name('front.subject');
    
    /* FrontendMemberController Route */
    Route::get('/members', [FrontendMemberController::class, 'members'])->name('front.members');
    Route::post('/members_issue', [FrontendMemberController::class, 'members_issue'])->name('front.members_issue');
   
    Route::get('/front/member_autocomplete', [App\Http\Controllers\Frontend\FrontendMemberController::class, 'memberAutocomplete'] );

    /* -------------- FRONTEND API ROUTES --------------*/

    /* FrontendBooksController Routes */
    
   
  
    Route::post('/front/update_book/{id}', [FrontendBooksController::class, 'update_book'])->name('update.book');
    Route::post('/front/add_book_size', [FrontendBooksController::class, 'add_book_size'])->name('add_book_size');
    // Route::post('/returnbooks', [FrontendBooksController::class, 'returnBooks'])->name('front.returnbooks');
    Route::get('/front/createdbooks', [FrontendBooksController::class, 'created_books'])->name('front.createdbooks');
    Route::get('/front/modifiedbooks', [FrontendBooksController::class, 'modified_books'])->name('front.modifiedbooks');
    Route::get('/add-book', [FrontendBooksController::class, 'addbook'])->name('front.addbook');
    Route::get('/edit-book', [FrontendBooksController::class, 'editbook'])->name('front.editbook');
    Route::get('/outstanding', [FrontendBooksController::class, 'outstanding'])->name('front.outstanding');
    Route::get("front/book_history", [FrontendBooksController::class, 'book_history'])->name('book_history');
  
    /* QuickAdvanceSearchController Routes */
    // Route::post('/front/quick_search_delete', [QuickAdvanceSearchController::class, 'quickSearch_delete']); 
    Route::get('/front/quick_search_return/{ids}', [QuickAdvanceSearchController::class, 'quickSearchReturn']); 
    Route::get('/front/quick_search_issue/{ids}', [QuickAdvanceSearchController::class, 'quickSearchIssue']); 
    /* FrontendDeletedBooksController Routes */
 
    /* FrontendMemberController Routes */
   
    Route::post('/front/update_member', [FrontendMemberController::class, 'update_member'])->name('update.member');
    Route::post('/front/add_member', [FrontendMemberController::class, 'add_member'])->name('add.member');
    Route::post('/front/delete_member', [FrontendMemberController::class, 'delete_member'])->name('delete.member');
   
    /* BhandarsController Routes */
    Route::get('/front/bhandar_dropdown', [BhandarsController::class, 'get_bhandar_dropdown']);

    /* Frontend Import Export Controller Routes */
    Route::post('/importFile', [FrontendImportController::class, 'importFile'])->name('importFile');

    /*-------------- BACKEND ROUTES --------------*/
    Route::get('/admin/dashboard', [BackendAuthController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/backend', [BackendAuthController::class, 'admin_backend'])->name('adminbackend');
    Route::get('/admin/password_change', [BackendAuthController::class, 'adminpassword_change'])->name('adminpass_change');

    /* AuditLogController ROUTE */
    Route::get('/admin/auth-audit-log', [AuditLogController::class, 'audit_log'])->name('auditlog');
    Route::get('/admin/auth-log-entry', [AuditLogController::class, 'log_entry'])-> name('logentry')->middleware('UserTabAccess');
    Route::get('/admin/view-auth-log-entry', [AuditLogController::class, 'view_logentry'])-> name('view_logentry')->middleware('UserTabAccess');
    Route::get('/admin/change-logentry/{id}', [AuditLogController::class, 'update'])-> name('update')->middleware('UserTabAccess');
    Route::post('/admin/delete_log_entries', [AuditLogController::class, 'delete_log_entries'])-> name('delete_log_entries')->middleware('UserTabAccess');
    Route::post('/admin/confirm_log_entries', [AuditLogController::class, 'confirm_log_entries'])-> name('confirm_log_entries')->middleware('UserTabAccess');

    /* AuthGroupController ROUTE */
    Route::get('/admin/auth', [AuthGroupController::class, 'authorization'])->name('adminauth');
    Route::get('/admin/group', [AuthGroupController::class, 'index'])->name('group');
    Route::get('/admin/add-group', [AuthGroupController::class, 'add_group'])->name('add_group')->middleware('UserTabAccess');
    Route::get('/admin/add-group-popup', [AuthGroupController::class, 'popup_group'])->name('popup_group')->middleware('UserTabAccess');
    Route::post('/admin/store-group', [AuthGroupController::class, 'store_group'])->name('store_group');
    Route::post('/admin/delete-group', [AuthGroupController::class, 'delete_group'])->name('delete_group')->middleware('UserTabAccess');
    Route::post('/admin/confirm-group', [AuthGroupController::class, 'confirm_group'])->name('confirm_group')->middleware('UserTabAccess');
    Route::get('/admin/change-group/{id}', [AuthGroupController::class, 'change_group'])->name('change_group')->middleware('UserTabAccess');
    Route::post('/admin/update-group/{id}', [AuthGroupController::class, 'update_group'])->name('update_group');
    Route::get('/admin/get_group_dropdown', [AuthGroupController::class, 'get_group_dropdown'])->name('get_group_dropdown');

    /* app settings */
    Route::get('/admin/appsettings', [AppSettingController::class, 'index'])->name('appsettings');    
    Route::get('/admin/add-appsettings', [AppSettingController::class, 'add_appsettings'])->name('add_appsettings')->middleware('UserTabAccess');
    Route::get('/admin/change-appsettings/{id}', [AppSettingController::class, 'change_appsettings'])->name('change_appsettings')->middleware('UserTabAccess');
    Route::post('/admin/store-appsettings',[AppSettingController::class, 'store_appsettings'])->name('store_appsettings');
    Route::post('/admin/update-appsettings/{id}',[AppSettingController::class, 'update_appsettings'])->name('update_appsettings');
    Route::post('/admin/confirm-appsettings', [AppSettingController::class, 'confirm_appsettings'])->name('confirm_appsettings')->middleware('UserTabAccess');
    Route::post('delete_appsettings', [AppSettingController::class, 'delete_appsettings'])->name('delete_appsettings'); 

    // import & export routes
    Route::get('/admin/import-appsettings', [AppSettingController::class, 'import_appsettings'])->name('import_appsettings');
    Route::post('/admin/import-appsetting-formats', [AppSettingController::class, 'import_appsetting_formats'])->name('import_appsetting_formats');
    Route::get('/admin/export-appsettings', [AppSettingController::class, 'export_appsettings'])->name('export_appsettings');
    Route::get('/admin/export-appsetting-formats', [AppSettingController::class, 'export_appsetting_formats'])->name('export_appsetting_formats');


    /* bhandars */
    Route::get('/admin/bhandar',[BhandarsController::class, 'index'])->name('bhandar');
    Route::get('/admin/add-bhandar',[BhandarsController::class, 'add_bhandar'])->name('add_bhandar')->middleware('UserTabAccess');
    Route::post('/admin/store-bhandar',[BhandarsController::class, 'store_bhandar'])->name('store_bhandar');
    Route::get('/admin/change-bhandar',[BhandarsController::class, 'change_bhandar_by_id'])->name('change_bhandar')->middleware('UserTabAccess');
    Route::post('/admin/update-bhandar/{bhandar_code}',[BhandarsController::class, 'update_bhandar'])->name('update.bhandar');
    Route::get('/admin/bhandar-history/{bhandar_code}', [BhandarsController::class, 'history'])->name('history')->middleware('UserTabAccess');
    Route::get('/admin/add-bhandar-popup', [BhandarsController::class, 'popup_bhandar'])->name('popup_bhandar')->middleware('UserTabAccess');
    Route::get('/admin/change-bhandar-popup', [BhandarsController::class, 'change_bhandar_popup'])->name('change_bhandar_popup')->middleware('UserTabAccess');
    Route::post('/admin/confirm-bhandar', [BhandarsController::class, 'confirm_bhandar'])->name('confirm_bhandar')->middleware('UserTabAccess');
    Route::post('/admin/delete_bhandar', [BhandarsController::class, 'delete_bhandar'])->name('delete_bhandar');
    Route::get('/bhandars_drowpdown', [BhandarsController::class, 'get_bhandar_dropdown'])->name('bhandars_drowpdown');
    Route::get('/admin/import-bhandar',  [BhandarsController::class, 'import_bhandar'] )->name('import_bhandar');
    Route::post('/admin/import-format', [BhandarsController::class, 'import_bdformat'])->name('import_bhandar_format');
    Route::get('/admin/export-bhandar',  [BhandarsController::class, 'export_bhandar'] )->name('export_bhandar');
    Route::post('/admin/export-format', [BhandarsController::class, 'export_bdformat'])->name('export_bhandar_format');

    // statistics 
    // Route::get('/admin/statastics/data',  [StatisticsController::class, 'Data'] )->name('statistics_data');
    Route::any('/admin/statastics/Data',  [StatisticsController::class, 'generateData'] )->name('generateData'); 
    Route::get('/admin/statastics/fetchSizeWiseData', [StatisticsController::class, 'fetchSizeWiseData'])->name('fetchSizeWiseData');
    Route::any('/admin/statastics/index-books', [StatisticsController::class, 'index_books'])->name('index_books');
    Route::any('/admin/statastics/fetch-books-with-index', [StatisticsController::class, 'fetchBooksWithIndex'])->name('fetchBooksWithIndex');
    Route::get('/admin/statastics/fetchIndexEntries', [StatisticsController::class, 'fetchIndexEntries'])->name('fetchIndexEntries');

    Route::any('/admin/statastics/fetch-unmapped-data', [StatisticsController::class, 'fetchUnmappedData'])->name('fetchUnmappedData');


   

    Route::get('/admin/statastics/media',  [StatisticsController::class, 'Media'] )->name('statistics_media');
    Route::get('/admin/statastics/get_media',  [StatisticsController::class, 'get_media'] )->name('statistics_get_media');
    
    Route::any('/admin/statastics/user',  [StatisticsController::class, 'User'] )->name('statistics_user');
    Route::any('/admin/statastics/get_user',  [StatisticsController::class, 'get_user'] )->name('statistics_get_user');


    // for front-side bhandar dropdown view
    Route::get('/view_bhandar_dropdown',[BhandarsController::class, 'view_bhandar_dropdown'])->name('view_bhandar_dropdown');
   
    // book 
    Route::get('/admin/books', [BookController::class, 'index'])->name('books');    
    Route::get('/admin/add-books', [BookController::class, 'add_book'])->name('add_book')->middleware('UserTabAccess');
    Route::post('/admin/store-books', [BookController::class, 'store_book'])->name('store_book');
    Route::get('/admin/change-books', [BookController::class, 'change_book'])->name('change_book')->middleware('UserTabAccess');
    Route::post('/admin/update-books/{ssid}', [BookController::class, 'update_book'])->name('update_book');
   
    Route::get('/admin/add-book-popup', [BookController::class, 'popup_book'])->name('popup_book');
    Route::get('/admin/change-book-popup', [BookController::class, 'change_book_popup'])->name('change_book_popup');
    Route::get('/get_language_size_drowpdown', [BookController::class, 'get_language_size_drowpdown'])->name('get_language_size_drowpdown');
    Route::get('/get_member_user_dropdown', [BookController::class, 'get_member_user_drowpdown'])->name('get_member_user_dropdown');
    Route::post('/admin/confirm-books', [BookController::class, 'confirm_books'])->name('confirm_books')->middleware('UserTabAccess');
    Route::post('/admin/delete-books', [BookController::class, 'deleteBooks'])->name('deleteBooks');
   
    // book import & export routes
    Route::get('/admin/import-books', [BookController::class, 'import_books'])->name('import_books');
    Route::post('/admin/import-books', [BookController::class, 'import_File'])->name('import_File');
    Route::get('/admin/export-books', [BookController::class, 'export_books'])->name('export_books');
    Route::get('/admin/export-books-format', [BookController::class, 'export_books_formats'])->name('export_books_formats');    
    
    /* book sizes */
    Route::get('/admin/booksize', [BookSizeController::class, 'index'])->name('booksize');
    Route::get('/admin/add-booksize', [BookSizeController::class, 'add_booksize'])->name('add_booksize')->middleware('UserTabAccess');
    Route::post('/admin/store-booksize', [BookSizeController::class, 'store_booksize'])->name('store_booksize');
    Route::get('/admin/change-booksize', [BookSizeController::class, 'change_booksize'])->name('change_booksize')->middleware('UserTabAccess');
    Route::post('/admin/update-booksize/{id}', [BookSizeController::class, 'update_booksize'])->name('update_booksize');
    Route::get('/admin/add-size-popup', [BookSizeController::class, 'popup_size'])->name('popup_size');
    Route::get('/admin/change-size-popup', [BookSizeController::class, 'change_size_popup'])->name('change_size_popup');
    Route::post('/admin/confirm-booksize', [BookSizeController::class, 'confirm_booksize'])->name('confirm_booksize')->middleware('UserTabAccess');
    Route::post('/admin/delete-booksize', [BookSizeController::class, 'delete_booksize'])->name('delete_booksize');
    
    //  import & export routes
    Route::get('/admin/import-booksize', [BookSizeController::class, 'import_booksize'])->name('import_booksize');
    Route::get('/admin/export-booksize', [BookSizeController::class, 'export_booksize'])->name('export_booksize');
    Route::get('/admin/export-booksize-format', [BookSizeController::class, 'export_booksize_formats'])->name('export_booksize_formats');

    /* book issue history */ 
    Route::get('/admin/bookissuehistory', [BookIssueHistoryController::class, 'index'])->name('bookissuehistory');
    Route::get('/admin/add-bookissuehistory', [BookIssueHistoryController::class, 'addBookIssueHistory'])->name('add_bookissuehistory')->middleware('UserTabAccess');
    Route::post('/admin/store-bookissuehistory', [BookIssueHistoryController::class, 'store_BookIssueHistory'])->name('store_bookissuehistory');
    Route::get('/admin/change-bookissuehistory/{id}', [BookIssueHistoryController::class, 'change_BookIssueHistory'])->name('change_bookissuehistory')->middleware('UserTabAccess');
    Route::post('/admin/update-bookissuehistory/{id}', [BookIssueHistoryController::class, 'update_BookIssueHistory'])->name('update_bookissuehistory');
    Route::post('/admin/confirm-bookissuehistory', [BookIssueHistoryController::class, 'confirm_bookissuehistory'])->name('confirm_bookissuehistory')->middleware('UserTabAccess');
    Route::post('/admin/delete-bookissuehistory', [BookIssueHistoryController::class, 'delete_bookissuehistory'])->name('delete_bookissuehistory');  
    Route::get('/admin/get_book_dropdown', [BookIssueHistoryController::class, 'get_book_dropdown'])->name('get_book_dropdown');
    // import & export routes
    Route::get('/admin/import-bookissuehistory', [BookIssueHistoryController::class, 'import_bookissuehistory'])->name('import_bookissuehistory');
    Route::get('/admin/export-bookissuehistory', [BookIssueHistoryController::class, 'export_bookissuehistory'])->name('export_bookissuehistory');
    Route::get('/admin/export-bookissuehistory-format', [BookIssueHistoryController::class, 'export_bookissuehistory_formats'])->name('export_bookissuehistory_formats');

    /* deleted book */
    Route::get('/admin/deletedbook', [DeletedBookController::class, 'index'])->name('deletedbook');
    Route::get('/admin/add-deletedbook', [DeletedBookController::class, 'add_deletedbook'])->name('add_deletedbook')->middleware('UserTabAccess');
    Route::post('/admin/store-deletedbook', [DeletedBookController::class, 'store_deletedbook'])->name('store_deletedbook');
    Route::get('/admin/change-deletedbook/{id}', [DeletedBookController::class, 'change_deletedbook'])->name('change_deletedbook')->middleware('UserTabAccess');
    Route::post('/admin/update-deletedbook/{id}', [DeletedBookController::class, 'update_deletedbook'])->name('update_deletedbook');
    Route::post('/admin/confirm-deletedbook', [DeletedBookController::class, 'confirm_deletedbook'])->name('confirm_deletedbook')->middleware('UserTabAccess');
    Route::post('/admin/delete-deletedbook', [DeletedBookController::class, 'delete_deletedbook'])->name('delete_deletedbook');
   
    // import & export routes
    Route::get('/admin/import-deletedbook', [DeletedBookController::class, 'import_deletedbook'])->name('import_deletedbook');
    Route::get('/admin/export-deletedbook', [DeletedBookController::class, 'export_deletedbook'])->name('export_deletedbook');
    Route::get('/admin/export-deletedbook-format', [DeletedBookController::class, 'export_deletedbook_formats'])->name('export_deletedbook_formats');

    /* language */
    Route::get('/admin/language', [LanguageController::class, 'index'])->name('language');
    Route::get('/admin/add-language',[LanguageController::class, 'add_language'])->name('add_language')->middleware('UserTabAccess');
    Route::post('/admin/store-language', [LanguageController::class, 'store_language'])->name('store_language');
    Route::get('/admin/change-language',[LanguageController::class, 'change_language'])->name('change_language')->middleware('UserTabAccess');
    Route::post('/admin/update-language/{id}', [LanguageController::class, 'update_language'])->name('update_language');
    Route::post('/admin/confirm-language', [LanguageController::class, 'confirm_language'])->name('confirm_language')->middleware('UserTabAccess');
    Route::post('/admin/delete-language', [LanguageController::class, 'delete_language'])->name('delete_language');
    Route::post('language', [LanguageController::class, 'checked_delete_language'])->name('checked_delete_language');
    Route::get('/admin/add-language-popup', [LanguageController::class, 'popup_language'])->name('popup_language');
    Route::get('/admin/change-language-popup', [LanguageController::class, 'change_language_popup'])->name('change_language_popup');    
   
    // import & export routes
    Route::any('/admin/import-language', [LanguageController::class, 'import_language'])->name('import_language');
    Route::get('/admin/export-language', [LanguageController::class, 'export_language'])->name('export_language');
    Route::get('/admin/export-language-format', [LanguageController::class, 'export_language_formats'])->name('export_language_formats');

    // find and replace language
    Route::get('admin/find-replace-language', [LanguageController::class, 'findAndReplaceLang'])->name('findAndReplace');
    Route::get('/get-language-bhandar-list', [LanguageController::class, 'getLanguageAndBhandarList'])->name('getLanguageAndBhandarList');
    Route::get('/api/get-languages', [LanguageController::class, 'getLanguagesMasterList'])->name('getLanguagesMasterList');// for Language Search Input dropdown
    Route::post('/replace-language', [LanguageController::class, 'replaceLanguage'])->name('replaceLanguage'); //for replace language functionality 
    Route::get('/get-language', [LanguageController::class, 'getBhandarsWithLanguages'])->name('getBhandarsWithLanguages');//for bhandars and their assigned languages


    /* adminuser */
    Route::get('/admin/user',  [UserController::class, 'index'] )->name('adminuser');
    Route::get('/admin/add-user',  [UserController::class, 'add_user'] )->name('add_user')->middleware('UserTabAccess');
    Route::post('/admin/store-user', [UserController::class, 'store_user'])->name('store_user');
    Route::get('/admin/change',  [UserController::class, 'change'] )->name('user.change')->middleware('UserTabAccess');
    Route::post('/admin/update-user/{id}', [UserController::class, 'update_user'])->name('update_user');
    Route::get('/admin/history/{id}',  [UserController::class, 'history'] )->name('user.history');
    Route::post('/admin/confirm-user', [UserController::class, 'confirm_user'])->name('confirm_user')->middleware('UserTabAccess');
    Route::post('/admin/delete',  [UserController::class, 'delete_user'] )->name('delete_user');
    Route::post('delete_user', [UserController::class, 'checked_delete_user'])->name('checked_delete_user');
    Route::get('/get_user_list', [UserController::class, 'get_user_list'])->name('get_user_list');
    Route::get('/admin/add-user-popup', [UserController::class, 'popup_user'])->name('popup_user');
    Route::get('/admin/change-user-popup', [UserController::class, 'change_user_popup'])->name('change_user_popup');
    // set bhandar id in seesion route 
    Route::get('/set_bhandarId_session', [UserController::class, 'set_bhandarId_session'])->name('set_bhandarId_session');
    // import & export routes
    Route::get('/admin/import-user',  [UserController::class, 'import_user'] )->name('import');
    Route::post('/admin/import', [UserController::class, 'import_adminuser'])->name('admin.import.post');
    Route::get('/admin/export-user',  [UserController::class, 'export_user'] )->name('export');
    Route::post('/admin/export', [UserController::class, 'export_adminuser'])->name('admin.export.post');
    
    /* member */
    Route::get('/admin/member', [MemberController::class, 'member'])->name('member');
    Route::get('/admin/member/add', [MemberController::class, 'add_member'])->name('add_member')->middleware('UserTabAccess');
    Route::post('/admin/store-member', [MemberController::class, 'store_member'])->name('store_member');
    Route::get('/admin/change-member',[MemberController::class, 'change_member'])->name('change_member')->middleware('UserTabAccess');
    Route::post('/admin/update-member/{mid}', [MemberController::class, 'update_member'])->name('update_member');
    Route::post('/admin/confirm-member', [MemberController::class, 'confirm_member'])->name('confirm_member')->middleware('UserTabAccess');
    Route::post('delete-member', [MemberController::class, 'delete_member'])->name('delete_member');
   
    Route::get('/admin/add-member-popup', [MemberController::class, 'popup_member'])->name('popup_member');
    Route::get('/admin/change-member-popup', [MemberController::class, 'change_member_popup'])->name('change_member_popup');

    //  import & export routes
    Route::get('/admin/import-member', [MemberController::class, 'import_member'] )->name('import_member');
    Route::post('/admin/member_import', [BhandarDataController::class, 'importBooks'])->name('admin.import.member');
    Route::get('/admin/export-member', [MemberController::class, 'export_member'] )->name('export_member');
    Route::post('/admin/member_export', [MemberController::class, 'export_admin_member'])->name('admin.export.member');

    // Bulkupload Controller
    Route::get('/admin/upload_form',[BulkuploadController::class, 'index'])->name('upload_form');
    Route::post('/admin/upload', [BulkuploadController::class, 'upload'])->name('upload');  
    Route::get('/admin/download', [BulkuploadController::class, 'downloadReportCSV'])->name('download_report');  
    //  index search import
    Route::get('/admin/import-indexSearch',[BulkuploadController::class, 'importIndexSearch'])->name('importIndexSearch');
    Route::post('/admin/import-indexSearch-format', [BulkuploadController::class, 'import_indexSearch_format'])->name('import_indexSearch_format'); 

    /* BhandarData Controller */ 
    Route::post('/admin/store_bhandar_data', [BhandarDataController::class, 'store_bhandarData'])->name('storeBhandarData');
    Route::get('/admin/edit-bhandarData', [BhandarDataController::class, 'edit_bhandarData'])->name('edit-bhandardata');
    Route::post('/admin/update_bhandarData', [BhandarDataController::class, 'update_bhandarData'])->name('updateBhandarData');
    Route::get('/admin/bhandar-datalist', [BhandarDataController::class, 'bhandar_datalist'])->name('bhandarDatalistView');
    Route::get('/admin/get_bhandar_data_list', [BhandarDataController::class, 'get_bhandar_data_list'])->name('bhandarDataList');
    Route::get('/get_bhandarcode_language_size_drowpdown', [BhandarDataController::class, 'get_bhandarcode_lang_size_dp'])->name('get_bhandarcode_lang_size_dp');
    Route::post('/admin/confirm-bhandardata', [BhandarDataController::class, 'confirm_bhandardata'])->name('confirm_bhandardata')/* ->middleware('UserTabAccess') */;
    Route::post('/admin/delete-bhandardata', [BhandarDataController::class, 'deleteBhandarData'])->name('delete-bhandardata');
    Route::get('/admin/download_bhandarData_import_report', [BhandarDataController::class, 'downloadBhandarDataImportReport'])->name('downloadBhandarDataImportReport');
    Route::any('/admin/change_reference', [BhandarDataController::class, 'change_reference'])->name('change_reference');
    Route::get('/admin/preview_change_reference', [BhandarDataController::class, 'preview_change_reference'])->name('admin_preview_change_reference');

    Route::get('/admin/admin_master_data_filter', [BhandarDataController::class, 'admin_master_data_filter'])->name('admin_master_data_filter');
    // BhandarData import excel
    Route::get('/admin/import-bhandardata', [BhandarDataController::class, 'import_bhandar_data'])->name('import_bhandar_data');
    Route::post('/admin/import-bhandardata-format', [BhandarDataController::class, 'import_bhandardata_format'])->name('import_bhandardata_format');
    // excel import 
    Route::get('/admin/import-bhandardata-format_excel', [BhandarDataController::class, 'import_bhandardata_format_excel'])->name('import_bhandardata_format_excel');
    // Route::post('/admin/export-bhandardata', [BhandarDataController::class, 'exportBhandarData'])->name('exportBhandarData');

    
    Route::get('/admin/BhandarData-sample-file',[BhandarDataController::class, 'downloadSampleFile'])->name('BhandarData_sample_file');
   
    Route::get('/admin/bulkimport-bhandardata', [BhandarDataController::class, 'bulkimport_bhandar_data'])->name('bulkimport_bhandar_data');
     
    Route::post('/admin/import-one-time-bhandardata-format', [BhandarDataController::class, 'import_one_time_bhandardata_format'])->name('import_one_time_bhandardata_format');


    // unmap Bhandar Controller
    Route::get('/admin/unmap-bhandardata', [UnmapBhandarDataController::class, 'index'])->name('unmap_bhandar_data');
    Route::get('/admin/edit-map-bhandarData', [UnmapBhandarDataController::class, 'edit_map_bhandarData'])->name('edit-map-bhandardata');
    Route::post('/admin/map_bhandarData', [UnmapBhandarDataController::class, 'mapp_bhandarData'])->name('mapp_bhandarData');
    Route::get('/admin/unmapped-matching', [UnmapBhandarDataController::class, 'unmapped_matching'])->name('unmapped_matching');
    
    Route::middleware(['cors'])->post('/admin/map_matching_bhandar_data', [UnmapBhandarDataController::class, 'mapMatchingBhandarData'])->name('map_matching_bhandar_data');
    
   
    Route::get('/admin/book_name_autocomplete', [UnmapBhandarDataController::class, 'book_name_autocomplete'])->name('book_name_autocomplete');
    
    /* MasterData Controller*/ 
    Route::get('/admin/edit-master-book', [MasterDataController::class, 'edit_master_book'])->name('edit-master-book');
    Route::post('/admin/update_master_data', [MasterDataController::class, 'update_masterData'])->name('updateMasterData');
    Route::get('/admin/master-booklist', [MasterDataController::class, 'master_booklist'])->name('masterDatalistView');
    Route::post('/admin/delete-selected-data', [MasterDataController::class, 'deleteSelectedData'])->name('delete_selected_data');

  
    Route::get('admin/masterdatalog', [MasterDataController::class, 'masterDataLog'])->name('masterDataLog'); 
    Route::post('admin/update_master_data_log', [MasterDataController::class, 'update_master_data_log'])->name('update_master_data_log'); 
  
    //Route::post('/admin/update_approved_data', [MasterDataController::class, 'update_approved_masterData']);
    Route::post('/admin/reject_changes', [MasterDataController::class, 'rejected_masterData']);
    Route::get('admin/masterData_langSize_dropdown', [MasterDataController::class, 'masterData_langSize_dropdown'])->name('masterData_langSize_dropdown');

    // MasterData import excel
    Route::get('/admin/import-masterdata', [MasterDataController::class, 'import_master_data'])->name('import_master_data');
    Route::post('/admin/import-masterdata-format', [MasterDataController::class, 'import_masterdata_format'])->name('import_masterdata_format');
    Route::get('/admin/MasterData-sample-file',[MasterDataController::class, 'downloadSampleFile'])->name('MasterData_sample_file');

     // MasterData export excel
    //  Route::get('/api/export-masterdata', [MasterDataController::class, 'export_master_data'])->name('export_master_data');
    //  Route::post('/api/export-masterdata-format', [MasterDataController::class, 'exportSelectedData'])->name('export_selected_data');

    Route::get('admin/find-replace', [MasterDataController::class, 'findAndReplace'])->name('findAndReplace');
    Route::get('admin/get_find_master_data', [MasterDataController::class, 'get_find_master_data'])->name('get_find_master_data');
    Route::post('admin/find_replace_data', [MasterDataController::class, 'find_replace_data'])->name('find.replace');


    /* Kruti Controller */
    Route::post('/admin/add_kruti', [KrutiController::class, 'add_kruti'])->name('add_kruti');    
    Route::get('/admin/krutilog', [KrutiController::class, 'krutiLog'])->name('krutiLog');   
   
    Route::post('/admin/update_approved_kruti', [KrutiController::class, 'update_approved_kruti'])->name('update_approved_kruti');
    Route::post('/admin/kruti_reject_changes', [KrutiController::class, 'rejected_kruti'])->name('kruti_reject_changes');


});

 Route::post('/admin/import-masterdata-format', [MasterDataController::class, 'import_masterdata_format'])->name('import_masterdata_format');
 
Route::middleware('web')->get('/test-session', function () {
    $sessionData = Session::get('kruti');
    $existingData = Session::get('kruti', []);
    return response()->json(['sessionData' => $sessionData, 'existingData' => $existingData]);
});
/* temporary use  */
Route::get('admin/setMasterMapped', [MasterDataController::class, 'setParentChild']);

// API Admin call 
Route::get('/admin/get-book-size', [BookSizeController::class, 'get_book_size_list'])->name('get_booksize');
Route::get('/admin/get-bookissuehistory-list', [BookIssueHistoryController::class, 'get_bookIssueHistory_list'])->name('bookIssueHistory_list');
Route::get('/admin/get-books-list', [BookController::class, 'get_books_list'])->name('book_list');
Route::get('/admin/get-deletedbook-list', [DeletedBookController::class, 'get_deletedbook_list'])->name('deletedbook_list');
Route::get('/get_member_list', [MemberController::class, 'get_member_list'])->name('get_member_list');
Route::get('/admin/get_unmap_bhandar_data_list', [UnmapBhandarDataController::class, 'get_unmap_bhandar_list'])->name('get_unmap_bhandar_list');
Route::get('/admin/get_unmap_master_data_list', [UnmapBhandarDataController::class, 'get_unmap_master_list'])->name('get_unmap_master_list');
Route::get('/admin/get_master_data_list', [MasterDataController::class, 'get_master_data_list'])->name('masterDataList');
Route::get('/admin/get_krutiLog_list', [KrutiController::class, 'get_kruti_log_list'])->name('get_krutiLog_list');
Route::get('/admin/kruti_modified_log_details', [KrutiController::class, 'kruti_modified_log_details'])->name('kruti_modified_log_details');
Route::get('/api/get_kruti_list', [KrutiController::class, 'get_kruti_list'])->name('get_kruti_list');
Route::get('/admin/delete_kruti', [KrutiController::class, 'delete'])->name('delete_kruti');
Route::post('/admin/update_kruti', [KrutiController::class, 'update_kruti'])->name('update_kruti');

Route::get('/bhandardata-import-samplecsv',[BhandarDataController::class, 'downloadsample_csv'])->name('BhandarData_sample_file_1');

Route::get('/admin/get_master_data_log_list', [MasterDataController::class, 'get_master_data_log_list'])->name('get_master_data_log_list');
Route::get('/admin/modified_log_details', [MasterDataController::class, 'modified_log_details']);
Route::get('/admin/get_list', [AuditLogController::class, 'get_log_entries_list']);
Route::get('/get_appsettings_list', [AppSettingController::class, 'get_appsettings_list'])->name('get_appsettings_list');

//Route::get('/front/get-bookissue-list', [FrontendBooksController::class, 'get_bookIssue_list']);
Route::get("api/present_copy", [FrontendBooksController::class, 'bookEntry_presentCopy_count'])->name('presentCopy');

Route::get('/get_language_list', [LanguageController::class, 'get_language_list'])->name('get_language_list');

Route::get('/front/booksize_dropdown', [FrontendBooksController::class, 'get_book_size_dropdown']);
Route::get('/front/get-bookissue-list', [FrontendBooksController::class, 'get_bookIssue_list']);
Route::get('/front/get_deletedbook_list', [FrontendDeletedBooksController::class, 'get_deletedbook_list']);
Route::get('/front/memberHistory_list', [FrontendMemberController::class, 'get_memberHistory_list']);
Route::get('front/member_list', [FrontendMemberController::class, 'get_member_list'])->name('member_list');
Route::get('/front/book_subject_list', [FrontendBooksController::class, 'book_subject_list']);
Route::get('/front/get_bookIssueHistory_list', [FrontendBooksController::class, 'get_bookIssueHistory_list']); 
Route::get('/api/lang_dropdown', [KrutiController::class, 'lang_dropdown'])->name('lang_dropdown');  
Route::get('/front/missing_book_list', [FrontendBooksController::class, 'get_missing_book_list']);
Route::get("front/bookEntry_master_data_filter", [FrontendBooksController::class, 'bookEntry_master_data_filter'])->name('bookEntry_master_data_filter');


Route::post('/front_login', [LoginController::class, 'login'])->name('front.login');
Route::get('/logout/{type}', [FrontendController::class, 'front_logout'])->name('shrut.logout');

// Add more routes as needed...

  // master's API route
  Route::post('/api/get_master_data', [App\Http\Controllers\API\MasterDataController::class, 'get_master_data']);

// Clear Configuration Cache
Route::get('/clear-config-cache', function() {
    Artisan::call('config:clear');
    return 'Configuration cache cleared!';
});

// Clear Route Cache
Route::get('/clear-route-cache', function() {
    Artisan::call('route:clear');
    return 'Route cache cleared!';
});

// Clear View Cache
Route::get('/clear-view-cache', function() {
    Artisan::call('view:clear');
    return 'View cache cleared!';
});

// Clear All Caches
Route::get('/clear-all-cache', function() {
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    Artisan::call('view:clear');
    $msg = 'All Laravel caches cleared!';
    if (function_exists('opcache_reset')) {
        if (opcache_reset()) {
            $msg .= ' And OPCache reset successfully!';
        } else {
            $msg .= ' But OPCache reset failed!';
        }
    } else {
        $msg .= ' OPCache extension not loaded.';
    }
    return $msg;
});
Route::get('/front/live_import', [App\Http\Controllers\LiveImportController::class, 'run']);
