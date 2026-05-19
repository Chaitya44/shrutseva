<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookIssueHistory extends Model
{
    use HasFactory;

    protected $table = 'backend_bookissuehistory';
    protected $primaryKey = 'id';
    public $timestamps = false; // Assuming created and modified timestamps are managed by database triggers

    protected $fillable = [
        'id',
        'issued',
        'returned',
        'bhandar_id',
        'book_id',
        'issued_by_id',
        'issued_to_id',
        'returned_by_id',
        'issued_to_notes',
    ];

   
    // Add any additional logic or methods here
}
