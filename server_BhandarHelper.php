<?php
// app/Helpers/BhandarHelper.php
namespace App\Helpers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Bhandars;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;

class BhandarHelper
{
   public static function getBhandarAndId(Request $request)
    {
        // Retrieve the Bhandar ID
       // Retrieve the Bhandar ID
      $bhandar_code = BhandarHelper::getBhandarId($request);
     // dd( $bhandar_code)
    
      
      // $bhandar_code = 'T02';
        
        // Try to fetch the Bhandar object from the database using the retrieved ID
        try {
            $bhandar = DB::table('backend_bhandar')->where('bhandar_code', $bhandar_code)->first();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle the case where Bhandar object with the given ID does not exist
            // You can return an error response, log an error, or return a default value
            $bhandar = null;
        }
        
        // Return the Bhandar object and its ID
        return ['bhandar' => $bhandar, 'bhandar_code' => $bhandar_code];
    }

    public static function getBhandarId($request=NULL)
    {
        //echo ("Bhandar ID from session");
        $bhandarId = null;
            //return $request->session()->get('bhandar_code');
         //return $bhandar_code = Session::get('bhandar_id');
        if(session()->has('bhandar_id')) {
            $bhandarId = session('bhandar_id');

         //   echo ("Bhandar ID from session: $bhandarId");
        } else {
          //  echo ("Bhandar ID is not stored in the session");
        }      
     //    echo ($bhandarId);   
            return $bhandarId;     
    }
        public static function get_bhandar_dropdown()
        {
            $bhandar_dropdown = DB::table('backend_bhandar')
                ->orderBy('sname', 'asc')
                ->get(['bhandar_code', 'sname', 'city']);

            return $bhandar_dropdown; 
        }
}
?>
