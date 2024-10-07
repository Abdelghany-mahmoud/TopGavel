<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'phone_number',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
      public function user()
      {
          return $this->belongsTo(User::class);
      }
  

   
      public function bids()
      {
          return $this->hasMany(Bid::class);
      }
    }