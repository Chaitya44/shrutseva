<?php

namespace App\Helpers;
use App\Models\Book;
use App\Models\Language;
use App\Models\BhandarData;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // Assuming you have Carbon installed for date manipulation


class BookHelper
{
    public static function createBookNumber($bhandar_code, $bookSize)
    {    
        $num = 0;
        $lastBookNumber = BhandarData::where('bhandar_code', $bhandar_code)
            ->where('size', $bookSize)->select('book_number')
            ->orderBy('book_number', 'DESC')->first();

        if(!empty($lastBookNumber)){
            $num = preg_replace('/[^0-9]/', '', $lastBookNumber->book_number);
        }

        $number = $num + 1;
        $newNumber = BookHelper::makeValid($bookSize, $number, '');
        list($isValidNumber, $inValidMessage) = BookHelper::isValid($bookSize, $newNumber, '');
        return [$number, $isValidNumber, $inValidMessage];
    }


    public static function makeValid($bookSize, $bookNumber, $separator = '-')
    {
        $bookNumber = trim(str_replace(' ', '', $bookNumber));
        $bookSize = trim(str_replace(' ', '', $bookSize));

        $index = -1;
        if (is_null($separator) || $separator === '') {
            $bookNumber = $bookSize . $bookNumber;
        } else {
            $index = strpos($bookNumber, $separator);

            if ($index !== false) {
                $bookNumber = substr($bookNumber, $index + 1);
            }

            $bookNumber = $bookSize . $separator . $bookNumber;
        }
        return $bookNumber; //, $numVal
    }

    public static function getBookSizeTopNumbers($booksizes = [], $bid = null)
    {
        $booksizelist = [];

        foreach ($booksizes as $booksize) {
           // dd($booksize);
            $booksizedisplay = $booksize;
            $booksizedisplay->top_number = 0;
            $booksizedisplay->last_number = 0;
            $booksizedisplay->lastmodified = '';
            $booksizedisplay->booksize_total = 0;
            $booksize_total = 0;

            try {
                \DB::enableQueryLog(); // Enable query log

                $book = BhandarData::where('size_id', $booksize->id)->where('deleted_at', 0)->orderByDesc('no')->first();


                $booksize_total = BhandarData::where('size_id', $booksize->id)->count();
                
                if ($book) {
                    $top_number = $book->book_number;
                    $booksizedisplay = $booksize;
                    $booksizedisplay->top_number = $top_number;
                    $booksizedisplay->last_number = $book->no;
                    $booksizedisplay->booksize_total = $booksize_total;
                    //dd(\DB::getQueryLog()); // Show results of log


                    $lastmodified = BhandarData::where('size_id', $booksize->id)->latest('created_date')->first();

                    if ($lastmodified) {
                        $booksizedisplay->lastmodified = Carbon::parse($lastmodified->created_date)->format('d-m-Y');
                    }
                }
            } catch (Exception $e) {
                // Handle exceptions if needed
            }

            $booksizelist[] = $booksizedisplay;
        }

        return $booksizelist;
    }

    
    public static function getLanguageDisplayList($languages = [], $bid = null)
    {
        $languagelist = [];

        foreach ($languages as $language) {
            $languagelistdisp = new \stdClass();
            $languagelistdisp->language = $language->name;
            $languagelistdisp->count = DB::table('BhandarData')
                ->where('language_id', $language->id)                
                ->count();
            
            $languagelist[] = $languagelistdisp;
        }
        // dd($languagelist);
        return $languagelist;
    }

    public static function isValid($bookSize, $fullBookNumber, $separator='-')
    {      
        // dd($bookSize, $fullBookNumber, $separator='-');
        try {
            [$aBookSize, $aBookNumber] = BookHelper::getSizeAndNumber($fullBookNumber, $separator);

            

            if (empty($aBookSize) || strpos($aBookSize, ' ') !== false) {
                return false;
            } elseif (empty($aBookNumber) || strpos($aBookNumber, ' ') !== false) {
                return false;
            } elseif ($bookSize !== $aBookSize) {
                return false;
            } elseif (!BookHelper::isNumber($aBookNumber)) {
                return false;
            } elseif (!BookHelper::isAlpha($aBookSize)) {
                return false;
            } else {
                return [$aBookSize.$aBookNumber, "BookNumber $aBookSize.$aBookNumber is a valid number"];
            }
        } catch (\Exception $e) {
            
            $error = "BookHelper.isValid Exception " . $bookSize .' '. $fullBookNumber. ' Reason: ' . $e->getMessage();
            return ['', $error];
        }
    }

    public static function getSizeAndNumber($number, $separator = '-')
    {

        $size = null;
        $no = null;

        if ($separator == null || $separator == '') {
            $bookNoArr = preg_split('/(\d+)/', $number, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
            if (is_array($bookNoArr) && count($bookNoArr) == 2) {
                $size = $bookNoArr[0];
                $no = $bookNoArr[1];
            } else {
               return "BOOK_NUMBER_ERROR: Unable to split book number " . str($number);
            }
        } else {
            $index = strpos($number, $separator);

            if ($index !== false) {
                $size = trim(substr($number, 0, $index));
                $no = trim(substr($number, $index + 1));
            } else {
                return "BOOK_NUMBER_ERROR: Unable to split book number " . $number;
            }
        }

        return [$size, $no];
    }

    public static function isNumber($number)
    {

        if (is_numeric($number)) {
            return true;
        }

        try {
            $decimal = intval($number);
            return true;
        } catch (\Exception $e) {
            // Do nothing
        }

        try {
            if (is_numeric(\IntlChar::getNumericValue($number))) {
                return true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        return false;
    }

    public static function isAlpha($s)
    {
        if (!ctype_alpha($s))
         {
            return false;
        } 
        // for ($i = 0; $i < mb_strlen($s); $i++) {
        //     $c = mb_substr($s, $i, 1);
        //     $category = \IntlChar::charType($c);
        //     dd($category);

        //     if ($category != \IntlChar::CHAR_CATEGORY_LETTER && $category != \IntlChar::CHAR_CATEGORY_MARK) {
        //         return false;
        //     }
        // }

        return true;
    }
    // Define other static methods here if needed
}
