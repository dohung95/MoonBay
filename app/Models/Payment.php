<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id', 'method', 'amount', 'bank_account', 'payment_info', 'status'
    ];
    
}