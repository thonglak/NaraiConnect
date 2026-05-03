<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OauthScope extends Model
{
    protected $table = 'oauth_scopes';

    protected $fillable = [
        'scope',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
