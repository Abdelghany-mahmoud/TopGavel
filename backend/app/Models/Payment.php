<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount', 
        'transaction_date', 
        'bidder_id', 
        'auction_id', 
    ];


    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
