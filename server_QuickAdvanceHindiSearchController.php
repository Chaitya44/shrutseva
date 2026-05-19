<?php

namespace App\Http\Controllers\Frontend;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use App\Helpers\BhandarHelper;
use Illuminate\Http\Request;
use App\Models\BookIssueHistory;
use App\Models\BhandarData;
use App\Models\Bhandar;
use App\Models\Member;
use App\Models\Book;
use Carbon\Carbon;
use Auth;
use Illuminate\Support\Facades\Http;
use App\Traits\NormalizesSearchTerm;


class QuickAdvanceHindiSearchController extends BaseController
{
    use NormalizesSearchTerm;
    /* ADVANCED search Api */
    public function quick_advance_book_search(Request $request)
    {

        // dd($request->all());
        if ($request->test == 1) {
            $start_time = microtime(true);
            \DB::enableQueryLog(); // Enable query log
        }

        $length = $request->get('length', '');
        $start = $request->get('start', '');
        $draw = $request->get('draw', '');
        $clientSide = $request->boolean('client_side');

        $baseQuery = DB::table('MasterData as master');
        $city = $request->get('city');
        $bhandarCode = $request->get('bhandar_code');

        if (is_string($city)) {
            $city = trim($city);
            $cityLower = strtolower($city);
            if ($city === '' || $cityLower === 'all' || $cityLower === 'null' || $cityLower === 'all cities') {
                $city = null;
            }
        }

        if ($city === 'my_bhandar' && !empty($bhandarCode)) {
            $baseQuery->whereRaw('FIND_IN_SET(?, master.ismap)', [$bhandarCode]);
        } else if ($city === null) {
            $baseQuery->where('master.ismap', '!=', '0');
        } else {
            $bhandarCodes = DB::table('backend_bhandar')
                ->where('city', 'like', '%' . $city . '%')
                ->pluck('bhandar_code')
                ->filter(function ($code) {
                    return $code !== null && $code !== '';
                })
                ->values()
                ->all();

            if (!empty($bhandarCodes)) {
                $baseQuery->where(function ($q) use ($bhandarCodes) {
                    foreach ($bhandarCodes as $code) {
                        $q->orWhereRaw('FIND_IN_SET(?, master.ismap)', [$code]);
                    }
                });
            } else {
                $baseQuery->whereRaw('1 = 0');
            }
        }

        $queryList = (clone $baseQuery)->orderBy('master.book_name_hindi', 'ASC');

        // Search a multi-word term against one or more Hindi _common columns using normalizeToCommon + LIKE
        $applySearch = function ($query, $term, array $commonColumns) {
            $searchTerm = trim((string) $term);
            if ($searchTerm === '') {
                return;
            }

            $terms = array_values(array_filter(preg_split('/\s+/', $searchTerm)));
            if (empty($terms)) {
                return;
            }

            $whereRawParams = [];
            $colConditions = [];
            foreach ($commonColumns as $col) {
                $perWord = [];
                foreach ($terms as $t) {
                    $normalized     = $this->normalizeToCommon($t);
                    $normalizedNoSp = preg_replace('/\s+/', '', $normalized);
                    $perWord[] = "($col LIKE ? OR REPLACE($col, ' ', '') LIKE ?)";
                    $whereRawParams[] = '%' . $normalized . '%';
                    $whereRawParams[] = '%' . $normalizedNoSp . '%';
                }
                $colConditions[] = '(' . implode(' AND ', $perWord) . ')';
            }

            $query->whereRaw('(' . implode(' OR ', $colConditions) . ')', $whereRawParams);
        };

        // Search a single term against one Hindi _common column using normalizeToCommon + LIKE
        $applySingle = function ($query, $commonColumn, $value) {
            $searchTerm = trim((string) $value);
            if ($searchTerm === '') {
                return;
            }
            $normalized     = $this->normalizeToCommon($searchTerm);
            $normalizedNoSp = preg_replace('/\s+/', '', $normalized);
            $query->whereRaw("($commonColumn LIKE ? OR REPLACE($commonColumn, ' ', '') LIKE ?)", [
                '%' . $normalized . '%',
                '%' . $normalizedNoSp . '%',
            ]);
        };

        if (!empty($request->title)) {
            $titleTerm = $request->title;
            $gujTitleTerm = $this->devanagariToGujarati($titleTerm);
            $queryList->where(function ($q) use ($applySearch, $titleTerm, $gujTitleTerm) {
                $q->where(function ($sq) use ($applySearch, $titleTerm) {
                    $applySearch($sq, $titleTerm, [
                        'master.book_name_hindi_common',
                        'master.alternate_name_hindi_common',
                        'master.Kruti_hindi_common',
                    ]);
                })->orWhere(function ($sq) use ($applySearch, $gujTitleTerm) {
                    $applySearch($sq, $gujTitleTerm, [
                        'master.book_name_common',
                        'master.alternate_name_common',
                        'master.Kruti_common',
                    ]);
                });
            });
        }

        if (!empty($request->author)) {
            $authorTerm = $request->author;
            $gujAuthorTerm = $this->devanagariToGujarati($authorTerm);
            $queryList->where(function ($q) use ($applySingle, $authorTerm, $gujAuthorTerm) {
                $q->where(function ($sq) use ($applySingle, $authorTerm) {
                    $applySingle($sq, 'master.author_hindi_common', $authorTerm);
                })->orWhere(function ($sq) use ($applySingle, $gujAuthorTerm) {
                    $applySingle($sq, 'master.author_common', $gujAuthorTerm);
                });
            });
        }

        if (!empty($request->editor)) {
            $editorTerm = $request->editor;
            $gujEditorTerm = $this->devanagariToGujarati($editorTerm);
            $queryList->where(function ($q) use ($applySingle, $editorTerm, $gujEditorTerm) {
                $q->where(function ($sq) use ($applySingle, $editorTerm) {
                    $applySingle($sq, 'master.editor_hindi_common', $editorTerm);
                })->orWhere(function ($sq) use ($applySingle, $gujEditorTerm) {
                    $applySingle($sq, 'master.editor_common', $gujEditorTerm);
                });
            });
        }

        if (!empty($request->publisher)) {
            $pubTerm = $request->publisher;
            $gujPubTerm = $this->devanagariToGujarati($pubTerm);
            $queryList->where(function ($q) use ($applySingle, $pubTerm, $gujPubTerm) {
                $q->where(function ($sq) use ($applySingle, $pubTerm) {
                    $applySingle($sq, 'master.publisher_hindi_common', $pubTerm);
                })->orWhere(function ($sq) use ($applySingle, $gujPubTerm) {
                    $applySingle($sq, 'master.publisher_common', $gujPubTerm);
                });
            });
        }

        if (!empty($request->lang_name)) {
            $langVal = $request->lang_name;
            if ($langVal === 'Gujarati') {
                $queryList->where(function($q) {
                    $q->where('master.language', 'like', '%G%')
                      ->orWhere('master.language', 'like', '%ગુ%');
                });
            } else if ($langVal === 'Hindi') {
                $queryList->where(function($q) {
                    $q->where('master.language', 'like', '%H%')
                      ->orWhere('master.language', 'like', '%હિ%')
                      ->orWhere('master.language', 'like', '%હ%')
                      ->orWhere('master.language', 'like', '%D%');
                });
            } else if ($langVal === 'Sanskrit') {
                $queryList->where(function($q) {
                    $q->where('master.language', 'like', '%S%')
                      ->orWhere('master.language', 'like', '%સં%');
                });
            } else if ($langVal === 'Prakrit') {
                $queryList->where(function($q) {
                    $q->where('master.language', 'like', '%P%')
                      ->orWhere('master.language', 'like', '%પ્રા%');
                });
            } else if ($langVal === 'English') {
                $queryList->where(function($q) {
                    $q->where('master.language', 'like', '%E%')
                      ->orWhere('master.language', 'like', '%અં%')
                      ->orWhere('master.language', 'like', '%ઇ%')
                      ->orWhere('master.language', 'like', '%english%');
                });
            } else {
                $langMap = [
                    'Gujarati' => 'G',
                    'Hindi' => 'H',
                    'English' => 'E',
                    'Sanskrit' => 'S',
                    'Prakrit' => 'P'
                ];
                if (isset($langMap[$langVal])) {
                    $langVal = $langMap[$langVal];
                }
                $queryList->where('master.language', 'like', $langVal . '%');
            }
        }

        if (!empty($request->subject)) {
            $subTerm = $request->subject;
            $gujSubTerm = $this->devanagariToGujarati($subTerm);
            $queryList->where(function ($q) use ($applySingle, $subTerm, $gujSubTerm) {
                $q->where(function ($sq) use ($applySingle, $subTerm) {
                    $applySingle($sq, 'master.subject_hindi_common', $subTerm);
                })->orWhere(function ($sq) use ($applySingle, $gujSubTerm) {
                    $applySingle($sq, 'master.subject_common', $gujSubTerm);
                });
            });
        }

        if (!empty($request->perticular)) {
            $pertTerm = $request->perticular;
            $gujPertTerm = $this->devanagariToGujarati($pertTerm);
            $queryList->where(function ($q) use ($applySingle, $pertTerm, $gujPertTerm) {
                $q->where(function ($sq) use ($applySingle, $pertTerm) {
                    $applySingle($sq, 'master.perticular_hindi_common', $pertTerm);
                })->orWhere(function ($sq) use ($applySingle, $gujPertTerm) {
                    $applySingle($sq, 'master.perticular_common', $gujPertTerm);
                });
            });
        }

        if (!empty($request->size)) {
            $queryList->where('master.size', $request->size);
        }

        // DataTables global search only in server-side mode.
        if (!$clientSide) {
            $dSearch = null;
            if (isset($_GET['search']) && !empty($_GET['search']['value'])) {
                $dSearch = $_GET['search']['value'];
            }
            if (!empty($dSearch)) {
                $gujDSearch = $this->devanagariToGujarati($dSearch);
                $queryList->where(function ($q) use ($applySearch, $dSearch, $gujDSearch) {
                    $q->where(function ($sq) use ($applySearch, $dSearch) {
                        $applySearch($sq, $dSearch, [
                            'master.book_name_hindi_common',
                            'master.alternate_name_hindi_common',
                            'master.perticular_hindi_common',
                            'master.Kruti_hindi_common',
                            'master.author_hindi_common',
                            'master.editor_hindi_common',
                            'master.publisher_hindi_common',
                            'master.subject_hindi_common',
                        ]);
                    })->orWhere(function ($sq) use ($applySearch, $gujDSearch) {
                        $applySearch($sq, $gujDSearch, [
                            'master.book_name_common',
                            'master.alternate_name_common',
                            'master.perticular_common',
                            'master.Kruti_common',
                            'master.author_common',
                            'master.editor_common',
                            'master.publisher_common',
                            'master.subject_common',
                        ]);
                    });
                });
            }
        }

        $countQuery = (clone $queryList)->select('master.SSID');
        $countQuery->reorder();
        $totalRecords = DB::query()->fromSub($countQuery, 'count_q')->count();

        if (!$clientSide && $length !== '' && $length != -1) {
            $queryList->limit((int) $length)->offset((int) $start);
        }

        $books = $queryList->select([
            'master.SSID as master_ssid',
            'master.MasterID',
            'master.book_name as book_name_original',
            DB::raw('COALESCE(NULLIF(TRIM(master.book_name_hindi), ""), master.book_name) as book_name'),
            'master.part',
            DB::raw('COALESCE(NULLIF(TRIM(master.alternate_name_hindi), ""), master.alternate_name) as alternate_name'),
            DB::raw('COALESCE(NULLIF(TRIM(master.Kruti_hindi), ""), master.Kruti) as Kruti'),
            DB::raw('COALESCE(NULLIF(TRIM(master.author_hindi), ""), master.author) as author'),
            DB::raw('COALESCE(NULLIF(TRIM(master.editor_hindi), ""), master.editor) as editor'),
            'master.language as lang_name',
            DB::raw('COALESCE(NULLIF(TRIM(master.publisher_hindi), ""), master.publisher) as publisher'),
            'master.page',
            'master.year_type',
            'master.year',
            'master.edition',
            DB::raw('COALESCE(NULLIF(TRIM(master.subject_hindi), ""), master.subject) as subject'),
            DB::raw('COALESCE(NULLIF(TRIM(master.note_hindi), ""), master.note) as book_note'),
            DB::raw('COALESCE(NULLIF(TRIM(master.perticular_hindi), ""), master.perticular) as perticular'),
            'master.cover',
        ])->get();

        foreach ($books as $book) {
            foreach (['book_name', 'alternate_name', 'Kruti', 'author', 'editor', 'publisher', 'subject', 'book_note', 'perticular'] as $field) {
                if (isset($book->$field) && is_string($book->$field)) {
                    if (preg_match('/[\x{0A80}-\x{0AFF}]/u', $book->$field)) {
                        $book->$field = $this->gujaratiToDevanagari($book->$field);
                    }
                }
            }
        }

        if ($request->test == 1) {
            dd(\DB::getQueryLog()); // Show results of log
        }

        return json_encode([
            'draw' => $draw,
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $totalRecords,
            'data' => $books,
        ]);
    }


    public function bhandar_book_search(Request $request)
    {
        if ($request->test == 1) {
            $start_time = microtime(true);
            //  dd($request->all());
            \DB::enableQueryLog(); // Enable query log

        }
        $length = '';
        $start = '';
        $draw = '';
        $search = '';
        $includeRelevant = $request->boolean('include_relevant');
        $clientSide = $request->boolean('client_side');
        // dd($request);
        if (isset($_GET['length'])) {
            $length = $_GET['length'];
        }

        if (isset($_GET['start'])) {
            $start = $_GET['start'];
        }

        if (isset($_GET['draw'])) {
            $draw = $_GET['draw'];
        }

        $baseQuery = DB::table('BhandarData as book')
            ->join('MasterData as master', 'master.SSID', 'book.MasterDataSSID')
            ->join('backend_bhandar as bhandar', 'bhandar.bhandar_code', 'book.bhandar_code')
            ->where('book.deleted_at', 0)
            ->when(
                $request->start_no && $request->end_no,
                function (Builder $builder) use ($request) {
                    $builder->whereBetween('book.no', [$request->start_no, $request->end_no]);
                }
            )->groupByRaw("book.MasterID,book.book_name,book.part,book.author,COALESCE(NULLIF(TRIM(book.editor),''), 'EMPTY'),book.language");

        // Clone the base query
        $queryCount = (clone $baseQuery);
        $queryList = (clone $baseQuery)->orderBy('book_number', 'ASC');


        if (!$clientSide && $length != -1) {
            $queryList->limit($length)->offset($start);
        }

        if (!empty($request->title)) {
            $searchWords = explode(' ', $request->title);

            $applyTitleFilter = function ($query) use ($searchWords, $includeRelevant) {
                $query->where(function ($outer) use ($searchWords, $includeRelevant) {
                    foreach ($searchWords as $word) {
                        $outer->where(function ($q) use ($word, $includeRelevant) {
                            if ($includeRelevant) {
                                $normalized = $this->normalizeSearchTerm($word);
                                $q->where('master.book_name_hindi', 'like', "%$word%")
                                    ->orWhere('master.book_name_hindi', 'regexp', $word)
                                    ->orWhere('master.book_name_hindi', 'regexp', $normalized)
                                    ->orWhere('master.alternate_name_hindi', 'like', "%$word%")
                                    ->orWhere('master.alternate_name_hindi', 'regexp', $word)
                                    ->orWhere('master.alternate_name_hindi', 'regexp', $normalized)
                                    ->orWhere('master.Kruti_hindi', 'like', "%$word%")
                                    ->orWhere('master.Kruti_hindi', 'regexp', $word)
                                    ->orWhere('master.Kruti_hindi', 'regexp', $normalized);
                            } else {
                                $q->where('master.book_name_hindi', 'like', "%$word%")
                                    ->orWhere('master.alternate_name_hindi', 'like', "%$word%")
                                    ->orWhere('master.Kruti_hindi', 'like', "%$word%");
                            }
                        });
                    }
                });
            };

            $applyTitleFilter($queryCount);
            $applyTitleFilter($queryList);
        }



        if (!empty($request->author)) {
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($request->author);
                $queryCount->whereRaw("(master.author_hindi LIKE ? OR master.author_hindi regexp ? OR master.author_hindi regexp ?)", ["%" . $request->author . "%", $request->author, $search]);
                $queryList->whereRaw("(master.author_hindi LIKE ? OR master.author_hindi regexp ? OR master.author_hindi regexp ?)", ["%" . $request->author . "%", $request->author, $search]);
            } else {
                $queryCount->where('master.author_hindi', 'like', "%" . $request->author . "%");
                $queryList->where('master.author_hindi', 'like', "%" . $request->author . "%");
            }
        }

        if (!empty($request->editor)) {
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($request->editor);
                $queryCount->whereRaw("(master.editor_hindi LIKE ? OR master.editor_hindi regexp ? OR master.editor_hindi regexp ?)", ["%" . $request->editor . "%", $request->editor, $search]);
                $queryList->whereRaw("(master.editor_hindi LIKE ? OR master.editor_hindi regexp ? OR master.editor_hindi regexp ?)", ["%" . $request->editor . "%", $request->editor, $search]);
            } else {
                $queryCount->where('master.editor_hindi', 'like', "%" . $request->editor . "%");
                $queryList->where('master.editor_hindi', 'like', "%" . $request->editor . "%");
            }
        }

        if (!empty($request->publisher)) {
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($request->publisher);
                $queryCount->whereRaw("(master.publisher_hindi LIKE ? OR master.publisher_hindi regexp ? OR master.publisher_hindi regexp ?)", ["%" . $request->publisher . "%", $request->publisher, $search]);
                $queryList->whereRaw("(master.publisher_hindi LIKE ? OR master.publisher_hindi regexp ? OR master.publisher_hindi regexp ?)", ["%" . $request->publisher . "%", $request->publisher, $search]);
            } else {
                $queryCount->where('master.publisher_hindi', 'like', "%" . $request->publisher . "%");
                $queryList->where('master.publisher_hindi', 'like', "%" . $request->publisher . "%");
            }
        }

        if (!empty($request->lang_name)) {
            $langMap = [
                'Gujarati' => 'G',
                'Hindi' => 'H',
                'English' => 'E',
                'Sanskrit' => 'S',
                'Prakrit' => 'P'
            ];
            $langVal = $request->lang_name;
            if (isset($langMap[$langVal])) {
                $langVal = $langMap[$langVal];
            }
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($langVal);
                $queryCount->whereRaw("(master.language LIKE ? OR master.language regexp ? OR master.language regexp ?)", [$langVal . "%", $langVal . "%", $search . "%"]);
                $queryList->whereRaw("(master.language LIKE ? OR master.language regexp ? OR master.language regexp ?)", [$langVal . "%", $langVal . "%", $search . "%"]);
            } else {
                $queryCount->where('master.language', 'like', $langVal . "%");
                $queryList->where('master.language', 'like', $langVal . "%");
            }
        }

        if (!empty($request->subject)) {
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($request->subject);
                $queryCount->whereRaw("(master.subject_hindi LIKE ? OR master.subject_hindi regexp ? OR master.subject_hindi regexp ?)", ["%" . $request->subject . "%", $request->subject, $search]);
                $queryList->whereRaw("(master.subject_hindi LIKE ? OR master.subject_hindi regexp ? OR master.subject_hindi regexp ?)", ["%" . $request->subject . "%", $request->subject, $search]);
            } else {
                $queryCount->where('master.subject_hindi', 'like', "%" . $request->subject . "%");
                $queryList->where('master.subject_hindi', 'like', "%" . $request->subject . "%");
            }
        }

        $size = $request->get('size');
        if (is_string($size)) {
            $size = trim($size);
            if ($size === '' || strtolower($size) === 'all') {
                $size = null;
            }
        }
        if (!empty($size)) {
            // In bhandar search, "Book Size" belongs to the physical book record (BhandarData.size)
            $queryCount->where('book.size', $size);
            $queryList->where('book.size', $size);
        }

        if (!empty($request->perticular)) {
            if ($includeRelevant) {
                $search = $this->normalizeSearchTerm($request->perticular);
                $queryCount->whereRaw("(master.perticular_hindi LIKE ? OR master.perticular_hindi regexp ? OR master.perticular_hindi regexp ?)", ["%" . $request->perticular . "%", $request->perticular, $search]);
                $queryList->whereRaw("(master.perticular_hindi LIKE ? OR master.perticular_hindi regexp ? OR master.perticular_hindi regexp ?)", ["%" . $request->perticular . "%", $request->perticular, $search]);
            } else {
                $queryCount->where('master.perticular_hindi', 'like', "%" . $request->perticular . "%");
                $queryList->where('master.perticular_hindi', 'like', "%" . $request->perticular . "%");
            }
        }

        if (!empty($request->city)) {

            // ->orWhere('reference', "!=", 'Master')

            if ($request->city == 'my_bhandar') {
                $queryCount->where('book.bhandar_code', $request->bhandar_code);
                $queryList->where('book.bhandar_code', $request->bhandar_code);
            } else {
                $queryCount->where('bhandar.city', $request->city);
                $queryList->where('bhandar.city', $request->city);
            }
        }


        if (isset($_GET['search']) && !empty($_GET['search']['value'])) {
            $dSearch = $_GET['search']['value'];
        }

        if (!empty($dSearch)) {

            $searchColumns = [
                'master.book_name_hindi',
                'master.alternate_name_hindi',
                'master.Kruti_hindi',
                'master.author_hindi',
                'master.editor_hindi',
                'master.publisher_hindi',
                'master.subject_hindi',
                'master.note_hindi',
                'master.perticular_hindi',
                'master.language',
            ];

            $applySearch = function ($query, $term, $includeRelevant, array $columns) {
                $searchTerm = trim((string) $term);
                if ($searchTerm === '') {
                    return;
                }

                $terms = array_values(array_filter(preg_split('/\s+/', $searchTerm)));
                if (empty($terms)) {
                    return;
                }

                $whereRawParams = [];
                $colConditions = [];
                foreach ($columns as $col) {
                    $perWord = [];
                    foreach ($terms as $t) {
                        $termNoSpace = preg_replace('/\s+/', '', $t);
                        if ($includeRelevant) {
                            $regex = $this->normalizeSearchTerm($t);
                            $regexNoSpace = $this->normalizeSearchTerm($termNoSpace);
                            $perWord[] = "($col LIKE ? OR $col regexp ? OR $col regexp ? OR REPLACE($col, \" \", \"\") LIKE ? OR REPLACE($col, \" \", \"\") regexp ? OR REPLACE($col, \" \", \"\") regexp ?)";
                            $whereRawParams[] = "%" . $t . "%";
                            $whereRawParams[] = preg_quote($t, '/');
                            $whereRawParams[] = $regex;
                            $whereRawParams[] = "%" . $termNoSpace . "%";
                            $whereRawParams[] = preg_quote($termNoSpace, '/');
                            $whereRawParams[] = $regexNoSpace;
                        } else {
                            $perWord[] = "($col LIKE ? OR REPLACE($col, \" \", \"\") LIKE ?)";
                            $whereRawParams[] = "%" . $t . "%";
                            $whereRawParams[] = "%" . $termNoSpace . "%";
                        }
                    }
                    $colConditions[] = '(' . implode(' AND ', $perWord) . ')';
                }
                $query->whereRaw('(' . implode(' OR ', $colConditions) . ')', $whereRawParams);
            };

            $applySearch($queryCount, $dSearch, $includeRelevant, $searchColumns);
            $applySearch($queryList, $dSearch, $includeRelevant, $searchColumns);
        }

        $books = $queryList->select([
            'book.MasterID',
            DB::raw('MAX(book.MasterDataSSID) as master_ssid'),
            DB::raw('GROUP_CONCAT(bhandar.bhandar_code ORDER BY book.size, book.no SEPARATOR ",") as bhandar_code'),
            DB::raw('GROUP_CONCAT(book.book_number ORDER BY book.size, book.no SEPARATOR ",") as book_number'),
            DB::raw('GROUP_CONCAT(bhandar.sname ORDER BY book.size, book.no SEPARATOR "|") as sname'),
            DB::raw('GROUP_CONCAT(bhandar.city ORDER BY book.size, book.no SEPARATOR "|") as city'),
            DB::raw('GROUP_CONCAT(IFNULL(bhandar.mobile, "") ORDER BY book.size, book.no SEPARATOR ",") as mobile'),
            DB::raw('GROUP_CONCAT(IFNULL(book.issued, "") ORDER BY book.size, book.no SEPARATOR ",") as issued'),
            DB::raw('MAX(book.SSID) as SSID'),
            DB::raw('ANY_VALUE(master.book_name) as book_name_original'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.book_name_hindi), ""), master.book_name)) as book_name'),
            DB::raw('MAX(master.size) as size'),
            DB::raw('MAX(master.part) as part'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.author_hindi), ""), master.author)) as author'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.editor_hindi), ""), master.editor)) as editor'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.publisher_hindi), ""), master.publisher)) as publisher'),
            DB::raw('ANY_VALUE(master.language) as lang_name'),
            DB::raw('ANY_VALUE(bhandar.contact) as contact'),
            DB::raw('MAX(master.page) as page'),
            DB::raw('MAX(master.edition) as edition'),
            DB::raw('MAX(master.year) as year'),
            DB::raw('MAX(master.year_type) as year_type'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.Kruti_hindi), ""), master.Kruti)) as Kruti'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.subject_hindi), ""), master.subject)) as subject'),
            DB::raw('ANY_VALUE(book.issued_to_notes) as issued_to_notes'),
            DB::raw('ANY_VALUE(book.issued_to_name) as issued_to_name'),
            DB::raw('MAX(book.issued_date) as issued_date'),
            DB::raw('MAX(book.no) as no'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.alternate_name_hindi), ""), master.alternate_name)) as alternate_name'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.note_hindi), ""), master.note)) as book_note'),
            DB::raw('ANY_VALUE(COALESCE(NULLIF(TRIM(master.perticular_hindi), ""), master.perticular)) as perticular'),
            DB::raw('ANY_VALUE(master.cover) as cover'),
        ])->get();

        $countQuery = (clone $queryCount)->select('book.MasterID');
        $countQuery->reorder();
        $totalRecords = DB::query()->fromSub($countQuery, 'count_q')->count();
        if ($request->test == 1) {
            dd(\DB::getQueryLog()); // Show results of log

        }
        $books = $books->map(function ($item) {
            $item->Kruti = '';
            if ($item->MasterID) {
                $kruti = DB::table('kruti')
                    ->where('MasterID', $item->MasterID)
                    ->where('book_name', $item->book_name_original ?? $item->book_name)
                    ->pluck('kruti')->toArray();

                $kruti = implode(', ', $kruti);
                $item->Kruti = $kruti;
            }


            if ($item->page == 0 || $item->page == 'NULL') {
                $item->page = '';
            }
            if ($item->year == 0 || $item->year == 'NULL') {
                $item->year = '';
            }
            // $pdf_link = "https://app.koofr.net/content/links/e3c4e773-c470-41c2-ae65-d4987781718a/files/get/PDF_{$item->MasterID}.pdf?path=/PDF_{$item->MasterID}.pdf";

            // $ch = curl_init($pdf_link);

            // // Use GET instead of HEAD to avoid 405 error
            // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            // curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            // curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects
            // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // optionally ignore SSL issues 
            // curl_exec($ch);
            // $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            // curl_close($ch);

            // if ($httpCode == 200) {
            //     $item->pdf= $pdf_link;
            // }            
            return $item;
        });

        $key = 'aseEncriptionKey'; // Ensure this key is the same in JS
        $iv = openssl_random_pseudo_bytes(16);

        foreach ($books as $book) {

            $ciphertext = openssl_encrypt($book->book_number, 'aes-128-cbc', $key, OPENSSL_RAW_DATA, $iv);
            $book->book_number = base64_encode($iv . $ciphertext);
            $ciphertext = openssl_encrypt($book->sname, 'aes-128-cbc', $key, OPENSSL_RAW_DATA, $iv);
            $book->sname = base64_encode($iv . $ciphertext);
        }
        //dd(\DB::getQueryLog()); // Show results of log
        return json_encode([
            'draw' => $draw,
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $totalRecords,
            'data' => $books,
            'regexp' => $search,
        ]);
    }


    public function quick_hindi_book_search(Request $request)
    {

        // dd($request->all());
        $length = $request->get('length', '');
        $start = $request->get('start', '');
        $draw = $request->get('draw', '');
        $search = $request->quick_search;
        $tableSearch = $request->input('search.value');
        $regexpstr = '';
        $clientSide = $request->boolean('client_side');

        $baseQuery = DB::table('MasterData as master');
        $city = $request->get('city');
        $bhandarCode = $request->get('bhandar_code');

        // Always exclude unmapped records
        // $baseQuery->where('master.ismap', '!=', '0');

        if ($city === 'my_bhandar' && !empty($bhandarCode)) {
            $baseQuery->whereRaw('FIND_IN_SET(?, master.ismap)', [$bhandarCode]);
        } else if ($city === 'all' || $city === null || $city === '') {
            $baseQuery->where('master.ismap', '!=', '0');
        } else {
            $bhandarCodes = DB::table('backend_bhandar')
                ->where('city', 'like', '%' . $city . '%')
                ->pluck('bhandar_code')
                ->filter(function ($code) {
                    return $code !== null && $code !== '';
                })
                ->values()
                ->all();

            if (!empty($bhandarCodes)) {
                $baseQuery->where(function ($q) use ($bhandarCodes) {
                    foreach ($bhandarCodes as $code) {
                        $q->orWhereRaw('FIND_IN_SET(?, master.ismap)', [$code]);
                    }
                });
            } else {
                $baseQuery->whereRaw('1 = 0');
            }
        }

        $queryList = (clone $baseQuery)->orderBy('master.book_name_hindi', 'ASC');

        // Normalize the search term and match against pre-computed Hindi _common columns AND transliterated Gujarati _common columns
        $applySearch = function ($query, $term) {
            $searchTerm = trim((string) $term);
            if ($searchTerm === '') {
                return;
            }

            $gujSearchTerm = $this->devanagariToGujarati($searchTerm);

            $termsHindi = array_values(array_filter(preg_split('/\s+/', $searchTerm)));
            $termsGuj = array_values(array_filter(preg_split('/\s+/', $gujSearchTerm)));

            if (empty($termsHindi)) {
                return;
            }

            $query->where(function ($q) use ($termsHindi, $termsGuj) {
                $q->where(function ($subQ) use ($termsHindi) {
                    $columnsHindi = [
                        'master.book_name_hindi_common',
                        'master.alternate_name_hindi_common',
                        'master.Kruti_hindi_common',
                    ];
                    $whereRawParams = [];
                    $colConditions = [];
                    foreach ($columnsHindi as $col) {
                        $perWord = [];
                        foreach ($termsHindi as $t) {
                            $normalized     = $this->normalizeToCommon($t);
                            $normalizedNoSp = preg_replace('/\s+/', '', $normalized);
                            $perWord[] = "($col LIKE ? OR REPLACE($col, ' ', '') LIKE ?)";
                            $whereRawParams[] = '%' . $normalized . '%';
                            $whereRawParams[] = '%' . $normalizedNoSp . '%';
                        }
                        $colConditions[] = '(' . implode(' AND ', $perWord) . ')';
                    }
                    $subQ->whereRaw('(' . implode(' OR ', $colConditions) . ')', $whereRawParams);
                })->orWhere(function ($subQ) use ($termsGuj) {
                    $columnsGuj = [
                        'master.book_name_common',
                        'master.alternate_name_common',
                        'master.Kruti_common',
                    ];
                    $whereRawParams = [];
                    $colConditions = [];
                    foreach ($columnsGuj as $col) {
                        $perWord = [];
                        foreach ($termsGuj as $t) {
                            $normalized     = $this->normalizeToCommon($t);
                            $normalizedNoSp = preg_replace('/\s+/', '', $normalized);
                            $perWord[] = "($col LIKE ? OR REPLACE($col, ' ', '') LIKE ?)";
                            $whereRawParams[] = '%' . $normalized . '%';
                            $whereRawParams[] = '%' . $normalizedNoSp . '%';
                        }
                        $colConditions[] = '(' . implode(' AND ', $perWord) . ')';
                    }
                    $subQ->whereRaw('(' . implode(' OR ', $colConditions) . ')', $whereRawParams);
                });
            });
        };

        // Main quick search (Hindi name / alternate / kruti etc.)
        if (!empty($search)) {
            $applySearch($queryList, $search);
        }

        // Total records after main quick search (but before "Search in Result")
        $totalCountQuery = (clone $queryList)->select('master.SSID');
        $totalCountQuery->reorder();
        $recordsTotal = DB::query()->fromSub($totalCountQuery, 'count_total_q')->count();

        // Apply "Search in Result" (DataTables global search) only in server-side mode.
        // In client-side mode we return all rows and the UI does per-page filtering.
        if (!$clientSide && !empty($tableSearch)) {
            $applySearch($queryList, $tableSearch);
        }

        $filteredCountQuery = (clone $queryList)->select('master.SSID');
        $filteredCountQuery->reorder();
        $recordsFiltered = DB::query()->fromSub($filteredCountQuery, 'count_filtered_q')->count();

        if (!$clientSide && $length !== '' && $length != -1) {
            $queryList->limit((int) $length)->offset((int) $start);
        }

        $books = $queryList->select([
            'master.SSID as master_ssid',
            'master.MasterID',
            'master.book_name as book_name_original',
            DB::raw('COALESCE(NULLIF(TRIM(master.book_name_hindi), ""), master.book_name) as book_name'),
            'master.part',
            DB::raw('COALESCE(NULLIF(TRIM(master.author_hindi), ""), master.author) as author'),
            DB::raw('COALESCE(NULLIF(TRIM(master.editor_hindi), ""), master.editor) as editor'),
            'master.language as lang_name',
            DB::raw('COALESCE(NULLIF(TRIM(master.publisher_hindi), ""), master.publisher) as publisher'),
        ])->get();

        foreach ($books as $book) {
            foreach (['book_name', 'author', 'editor', 'publisher'] as $field) {
                if (isset($book->$field) && is_string($book->$field)) {
                    if (preg_match('/[\x{0A80}-\x{0AFF}]/u', $book->$field)) {
                        $book->$field = $this->gujaratiToDevanagari($book->$field);
                    }
                }
            }
        }

        return json_encode([
            'draw' => $draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $books,
            'regexp' => $regexpstr,
        ]);
    }

    public function quick_hindi_book_details(Request $request)
    {



        $masterSsid = $request->get('master_ssid');

        // print_r($masterId);
        // dd($masterSsid);
        if (empty($masterSsid)) {
            return response()->json(['error' => 'master_ssid is required'], 400);
        }

        $master = null;
        if (!empty($masterSsid)) {
            $master = DB::table('MasterData as master')
                ->where('master.SSID', $masterSsid)
                ->first();
        }



        $query = DB::table('BhandarData as book')
            ->join('backend_bhandar as bhandar', 'bhandar.bhandar_code', 'book.bhandar_code')
            ->where('book.deleted_at', 0)
            ->when(!empty($masterSsid), function ($q) use ($masterSsid) {
                $q->where('book.MasterDataSSID', $masterSsid);
            });


        if ($request->city == 'my_bhandar') {
            $query->where('book.bhandar_code', $request->bhandar_code);
        } else if (!empty($request->city) && $request->city !== 'all') {
            $query->whereRaw("(bhandar.city LIKE ?)", ['%' . $request->city . '%']);
        }

        $detail = $query->select([
            DB::raw('MAX(book.MasterDataSSID) as master_ssid'),
            DB::raw('MAX(book.MasterID) as MasterID'),
            DB::raw('GROUP_CONCAT(bhandar.bhandar_code ORDER BY book.size, book.no SEPARATOR "," ) as bhandar_code'),
            DB::raw('GROUP_CONCAT(book.book_number ORDER BY book.size, book.no SEPARATOR ",") as book_number'),
            DB::raw('GROUP_CONCAT(bhandar.sname ORDER BY book.size, book.no SEPARATOR "|") as sname'),
            DB::raw('GROUP_CONCAT(bhandar.city ORDER BY book.size, book.no SEPARATOR "|") as city'),
            DB::raw('GROUP_CONCAT(IFNULL(bhandar.mobile, "") ORDER BY book.size, book.no SEPARATOR ",") as mobile'),
            DB::raw('GROUP_CONCAT(IFNULL(book.issued, "") ORDER BY book.size, book.no SEPARATOR "," ) as issued'),
            DB::raw('MAX(book.bhandar_note) as book_note'),
            DB::raw('MAX(book.perticular) as perticular'),
        ])->groupBy('book.MasterDataSSID')->first();

        if (!$detail) {
            return response()->json(['data' => null]);
        }

        if ($master) {
            $detail->book_name_original = $master->book_name;
            $detail->MasterID = $master->MasterID;
            $detail->book_name = trim((string) ($master->book_name_hindi ?? '')) !== '' ? $master->book_name_hindi : $master->book_name;
            $detail->part = $master->part;
            $detail->alternate_name = trim((string) ($master->alternate_name_hindi ?? '')) !== '' ? $master->alternate_name_hindi : $master->alternate_name;
            $detail->Kruti = trim((string) ($master->Kruti_hindi ?? '')) !== '' ? $master->Kruti_hindi : $master->Kruti;
            $detail->author = trim((string) ($master->author_hindi ?? '')) !== '' ? $master->author_hindi : $master->author;
            $detail->editor = trim((string) ($master->editor_hindi ?? '')) !== '' ? $master->editor_hindi : $master->editor;
            $detail->lang_name = $master->language;
            $detail->page = $master->page;
            $detail->year_type = $master->year_type;
            $detail->year = $master->year;
            $detail->edition = $master->edition;
            $detail->publisher = trim((string) ($master->publisher_hindi ?? '')) !== '' ? $master->publisher_hindi : $master->publisher;
            $detail->subject = trim((string) ($master->subject_hindi ?? '')) !== '' ? $master->subject_hindi : $master->subject;
            $detail->book_note = trim((string) ($master->note_hindi ?? '')) !== '' ? $master->note_hindi : $master->note;
            $detail->perticular = trim((string) ($master->perticular_hindi ?? '')) !== '' ? $master->perticular_hindi : ($master->perticular ?? ($detail->perticular ?? null));
            $detail->cover = $master->cover;
        }

        $key = 'aseEncriptionKey'; // Ensure this key is the same in JS
        $iv = openssl_random_pseudo_bytes(16);
        $ciphertext = openssl_encrypt($detail->book_number ?? '', 'aes-128-cbc', $key, OPENSSL_RAW_DATA, $iv);
        $detail->book_number = base64_encode($iv . $ciphertext);
        $ciphertext = openssl_encrypt($detail->sname ?? '', 'aes-128-cbc', $key, OPENSSL_RAW_DATA, $iv);
        $detail->sname = base64_encode($iv . $ciphertext);

        return response()->json(['data' => $detail]);
    }

    public function get_book_details(Request $request)
    {
        return $this->quick_hindi_book_details($request);
    }






    public function quickSearch_delete(Request $request)
    {
        $error = null;
        $success = null;
        $delBooksList = '';
        $notDelBooksList = '';

        DB::beginTransaction();  // Start transaction for atomic operations

        try {
            // Split the book numbers into an array
            $bookNumbers = explode(',', $request->input('book_numbers'));

            // Fetch books by SSID
            $books = BhandarData::whereIn('SSID', $bookNumbers)->get();

            foreach ($books as $book) {
                // Skip issued books
                if ($book->issued != 0) {
                    $notDelBooksList .= $book->book_number . ',';
                } else {
                    // Insert deleted book into backend_deletedbook
                    $data = $book->toArray();
                    $data['created_at'] = Carbon::now()->format('Y-m-d H:i:s'); // Current timestamp
                    $data['updated_at'] = Carbon::now()->format('Y-m-d H:i:s'); // Current timestamp
                    DB::table('backend_deletedbook')->insert($data);

                    // Delete the record from BhandarData table
                    $book->delete();

                    $delBooksList .= $book->book_number . ',';
                }
            }

            DB::commit();  // Commit the transaction

        } catch (\Exception $e) {
            DB::rollBack();  // Rollback if any error occurs
            $error = "Error occurred while deleting book! Reason: " . $e->getMessage();
        }

        // Build response messages
        if (!$error) {
            if ($notDelBooksList != '') {
                $error = 'Issued book(s) ' . $notDelBooksList . ' cannot be deleted!';
            }
            if ($delBooksList != '') {
                $success = 'Book(s) ' . $delBooksList . ' deleted. ' . ($error ? $error : '');
                $error = null;
            }
        }

        // Return response based on success or error
        if ($error) {
            return response()->json(['error' => $error], 400);
        } else {
            return response()->json(['success' => $success], 200);
        }
    }

    function quickSearchReturn($ids)
    {
        $error = null;
        $success = null;
        $notIssued = '';
        $user = auth()->user();
        // Assuming getBhandarId is a helper function similar to Laravel helpers

        $bhandarId =  BhandarHelper::getBhandarId($user);

        // dd($bhandarId);

        //list($bhandar, $bhandarId) = BhandarHelper::getBhandarAndId($request);
        //   \DB::enableQueryLog(); // Enable query log

        DB::beginTransaction();
        try {
            //  $bookNumbers = explode(',',$ids);           
            $bookNumbers = is_array($ids) ? $ids : [$ids];

            // dd('bookNumbers:',$bookNumbers);
            $books = BhandarData::whereIn('SSID', $bookNumbers)->get();
            //    dd('books:',$books);
            foreach ($books as $book) {
                if ($book->issued_id !== null) {
                    try {
                        $bi = BookIssueHistory::findOrFail($book->issued_id);
                        $bi->returned_by = Auth::user()->id;
                        $bi->returned = now();
                        //  $bi->save();
                    } catch (\Exception $e) {
                        // Ignore Book History Errors
                    }

                    // Reset book issue related fields
                    $book->update([
                        'issued' => false,
                        'issued_to_name' => null,
                        'issued_to_mobile' => null,
                        'issued_to_email' => null,
                        'issued_to_address' => null,
                        'issued_date' => null,
                        'issued_to_notes' => null,
                        'issued_to' => null,
                        'issued_id' => null,
                    ]);

                    if ($success) {
                        $success .= $book->number . ',';
                    } else {
                        $success = 'Returned books ' . $book->number . ',';
                    }
                } else {
                    // Book not issued, do nothing
                    if ($notIssued) {
                        $notIssued .= $book->number . ',';
                    } else {
                        $notIssued = 'Already returned books ' . $book->number . ',';
                    }
                }
            }
            // dd(\DB::getQueryLog()); // Show results of log


            // Combine success and notIssued messages
            if ($notIssued) {
                if ($success) {
                    $success .= '    .' . $notIssued;
                } else {
                    $success = $notIssued;
                }
            }
        } catch (\Exception $e) {
            $error = __('Error occurred while returning book! ') . __(' Reason: ') . $e->getMessage();
        } finally {
            DB::commit();
        }

        if ($error) {
            //return response($error, 400);
            return redirect()->route('quickSearch')->with('message', $error);
        } else {
            // return response()->json(['success' => $success]);
            return redirect()->route('quickSearch')->with('message', $success);
        }
    }

    function quickSearchIssue(Request $request, $mid)
    {

        $error = null;
        $success = 'Issued Books ';
        $member = null;
        $currentDate = Carbon::now();
        $book_id = $request->book_id;
        $notes = 'test';
        $user = auth()->user();
        $bhandarId =  BhandarHelper::getBhandarId($user);

        try {
            $member = Member::where('mid', $mid)->firstOrFail();
        } catch (\Exception $e) {
            $error = "Error: One of the required fields is missing. Fill out all details";
            return response()->json(['error' => $error], 400);
        }

        $book_id = is_array($book_id) ? $book_id : [$book_id];
        $alreadyIssuedBooks = BhandarData::whereIn('SSID', $book_id)->where('issued', true)->pluck('id')->toArray();

        if (!empty($alreadyIssuedBooks)) {
            $error = "Error, already issued books. Return them before issuing: " . implode(',', $alreadyIssuedBooks);
            return response()->json(['error' => $error], 400);
        } else {
            try {
                DB::beginTransaction();
                $selectedBooks = explode(',', $request->book_id);
                foreach ($selectedBooks as $selectedBook) {
                    $book = BhandarData::where('SSID', $selectedBook)->firstOrFail();
                    echo '<pre>';
                    print_r($book);
                    echo '</pre>';
                    exit;
                    $bookIssue = new BookIssueHistory();
                    $bookIssue->book_id = $book->id;
                    $bookIssue->issued_to_id = $member->id;
                    $bookIssue->issued_by_id = $request->user()->id;
                    $bookIssue->issued_to_notes = $notes;
                    $bookIssue->bhandar_id = $bhandarId;
                    $bookIssue->save();

                    $issued_id = $bookIssue->id;

                    $book->update([
                        'issued' => 1,
                        'issued_to_name' => $member->name,
                        'issued_to_mobile' => $member->mobile,
                        'issued_to_email' => $member->email,
                        'issued_to_address' => $member->address,
                        'issued_date' => $currentDate,
                        'issued_to_notes' => $notes,
                        'issued_to' => $member->id,
                        'issued_id' => $issued_id,
                    ]);
                    $success .= $book->number . ',';
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $error = $success . "Error occurred while issuing book member " . $e->getMessage();
                return response()->json(['error' => $error], 400);
            }
        }

        return response()->json(['success' => $success]);


        // old
        $b_ids = explode(',', $request->book_id);
        $user = Auth::user();
        $currentDate = Carbon::now();

        /* get member data where member id matched */
        $member = DB::table('backend_member')
            ->where('backend_member.mid', $mid)->first();
        // dd($member);
        foreach ($b_ids as $id) {
            if (!empty($member)) {
                /* update issue details in backend_book table */
                $book = DB::table('backend_book')->where('id', $id)
                    ->update([
                        "issued" =>  0,
                        "issued_to_name" =>  $member->name,
                        "issued_to_email" =>  $member->email,
                        "issued_to_mobile" =>  $member->mobile,
                        "issued_to_address" =>  $member->address,
                        "issued_date" =>  $currentDate,
                        "issued_to_notes" =>  $member->notes,
                        "issued_id" =>  $member->mid,
                    ]);
            }

            $book = DB::table('backend_book')->where('id', $id)->first();

            /* insert entry into backend_bookissuehistory table */
            $return = DB::table('backend_bookissuehistory')->insert([
                "issued" => $book->issued_date,
                "returned" => null,
                "bhandar_id" => $book->bhandar_id,
                "book_id" => $book->id,
                /*  "issued_by_id" => $user->id , */
                "issued_to_id" => $book->issued_to_id,
                "returned_by_id" => null,
                "issued_to_notes" => $book->issued_to_notes,
            ]);
        }
        return redirect()->route('quickSearch')->with('message', 'Book Issued!');
    }

   public function bookNumber_popup(Request $request)
    {
        $masterSsid = $request->input('master_ssid');
        $masterId = $request->input('masterid');

        $queryData = DB::table("BhandarData")
            ->join('backend_bhandar as bhandar', 'bhandar.bhandar_code', 'BhandarData.bhandar_code')
            ->when(!empty($masterSsid), function ($q) use ($masterSsid) {
                $q->where('BhandarData.MasterDataSSID', $masterSsid);
            }, function ($q) use ($masterId) {
                // Backward compatibility (older UI sends masterid)
                $q->where('BhandarData.MasterID', $masterId);
            })
            ->where('BhandarData.bhandar_code', $request->bhandar_code)
            // ->where('BhandarData.book_name', $request->book_name)
            ->where('deleted_at', 0);

        if (!empty($request->title)) {
            $searchTerms = $request->title;
            $searchWords = explode(' ', $searchTerms); 
                
            $whereConditions = [];
            foreach ($searchWords as $word) {
                $search = $this->normalizeSearchTerm($word, '');

                $whereConditions[] = "(book_name LIKE ? OR book_name REGEXP ? OR book_name regexp ? OR alternate_name LIKE ? OR alternate_name REGEXP ? OR alternate_name REGEXP ? OR Kruti LIKE ? OR Kruti REGEXP ? OR Kruti REGEXP ?)";

                // Add parameters for both LIKE and REGEXP
                $whereRawParams[] = "%" . $word . "%";   // LIKE for book_name
                $whereRawParams[] = $word;               // REGEXP for book_name
                $whereRawParams[] = $search;             // REGEXP for book_name
                $whereRawParams[] = "%" . $word . "%";   // LIKE for alternate_name
                $whereRawParams[] = $word;               // REGEXP for alternate_name
                $whereRawParams[] = $search;             // REGEXP for alternate_name
                $whereRawParams[] = "%" . $word . "%";   // LIKE for Kruti
                $whereRawParams[] = $word;               // REGEXP for Kruti
                $whereRawParams[] = $search;             // REGEXP for Kruti
            }                
            // Combine the individual word conditions with AND
            $ConditionQuery = implode(' AND ', $whereConditions);                
                        
            // Apply the dynamic WHERE clause to the query
            $queryData->whereRaw($ConditionQuery, $whereRawParams);
        }
        
        if(!empty($request->author)){
            $searchTerms = $request->author;
            $search = $this->normalizeSearchTerm($searchTerms, '');
            $queryData->whereRaw("(author Like ? OR author regexp ? OR author regexp ?)", [$request->author, $request->author, $search]);
        }

        if(!empty($request->editor)){
            $searchTerms = $request->editor;
            $search = $this->normalizeSearchTerm($searchTerms, '');
            $queryData->whereRaw("(editor Like ? OR editor regexp ? OR editor regexp ?)", [$request->editor, $request->editor, $search]);
        }

        if(!empty($request->publisher)){
            $searchTerms = $request->publisher;
            $search = $this->normalizeSearchTerm($searchTerms, '');
            $queryData->whereRaw("(publisher Like ? OR publisher regexp ? OR publisher regexp ?)", [$request->publisher, $request->publisher, $search]);
        }

        if(!empty($request->lang_name)){
            $searchTerms = $request->lang_name;
            $search = $this->normalizeSearchTerm($searchTerms, '');
            $queryData->whereRaw("(book.language Like ? OR book.language regexp ? OR book.language regexp ?)", [$request->lang_name."%", $request->lang_name."%", $search."%"]);
        }

        if(!empty($request->subject)){
            $searchTerms = $request->subject;
            $search = $this->normalizeSearchTerm($searchTerms, '');
            $queryData->whereRaw("(subject Like ? OR subject regexp ? OR subject regexp ?)", [$request->subject, $request->subject, $search]);
        }

        if($request->size != ""){
            $queryData->where('size', $request->size);
        }

        if(!empty($search = $request->quick_search)){
            $searchWords = explode(' ', $search); 
            $whereConditions = [];

            foreach ($searchWords as $word) {
                $search = $this->normalizeSearchTerm($word, '');
                $whereConditions[] = "(book_name Like ? OR book_name regexp ? OR book_name regexp ? OR alternate_name LIKE ? OR alternate_name regexp ? OR alternate_name regexp ? OR kruti LIKE ? OR kruti regexp ? OR kruti regexp ? OR author Like ? OR author regexp ? OR author regexp ? OR publisher Like ? OR publisher regexp ? OR publisher regexp ? OR language LIKE ? OR editor Like ? OR editor regexp ? OR editor regexp ? OR bhandar.sname LIKE ? OR page LIKE ? OR year LIKE ? OR subject Like ? OR subject regexp ? OR subject regexp ? OR BhandarData.note regexp ? OR book_number LIKE ?)";

                // Add parameters for both LIKE and REGEXP
                $whereRawParams[] = "%" . $word . "%";   // LIKE for book_name
                $whereRawParams[] = $word;               // REGEXP for book_name
                $whereRawParams[] = $search;          // REGEXP for book_name
                $whereRawParams[] = "%" . $word . "%";   // LIKE for alternate_name
                $whereRawParams[] = $word;               // REGEXP for alternate_name
                $whereRawParams[] = $search;          // REGEXP for alternate_name
                $whereRawParams[] = "%" . $word . "%";   // LIKE for Kruti
                $whereRawParams[] = $word;               // REGEXP for Kruti
                $whereRawParams[] = $search;          // REGEXP for Kruti
                $whereRawParams[] = "%" . $word . "%";   // LIKE for author
                $whereRawParams[] = $word;               // REGEXP for author
                $whereRawParams[] = $search;          // REGEXP for author
                $whereRawParams[] = "%" . $word . "%";   // LIKE for publisher
                $whereRawParams[] = $word;               // REGEXP for publisher
                $whereRawParams[] = $search;          // REGEXP for publisher
                $whereRawParams[] = "%" . $word . "%";   // LIKE for language
                $whereRawParams[] = "%" . $word . "%";   // LIKE for editor
                $whereRawParams[] = $word;               // REGEXP for editor
                $whereRawParams[] = $search;          // REGEXP for editor
                $whereRawParams[] = "%" . $word . "%";   // LIKE for bhandar
                $whereRawParams[] = "%" . $word . "%";   // LIKE for page
                $whereRawParams[] = "%" . $word . "%";   // LIKE for year
                $whereRawParams[] = "%" . $word . "%";   // LIKE for subject
                $whereRawParams[] = $word;               // REGEXP for subject
                $whereRawParams[] = $search;          // REGEXP for subject
                $whereRawParams[] = $search;          // REGEXP for note
                $whereRawParams[] = "%" . $word . "%";   // LIKE for editor
            }                

            // Combine the individual word conditions with AND
            $ConditionQuery = implode(' AND ', $whereConditions);                
                        
            // Apply the dynamic WHERE clause to the query
            $queryData->whereRaw($ConditionQuery, $whereRawParams);
        }


        $queryData->when($request->start_no != "" && $request->end_no != "",
                function(Builder $builder) use ($request){
                    $builder->whereBetween('no',[$request->start_no, $request->end_no]);
                }                
            );

        $queryData = $queryData->orderBy('size', 'ASC')->orderBy('no', 'ASC')->get(['SSID', 'book_number', 'issued']);

        return response()->json([
            'status' => true,
            'data' => $queryData,
        ]);
    }
}
