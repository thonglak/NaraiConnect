<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class OauthAuthorizationCode extends Model
{
    protected $table = 'oauth_authorization_codes';
    protected $primaryKey = 'authorization_code';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'authorization_code',
        'client_id',
        'user_id',
        'redirect_uri',
        'expires',
        'scope',
    ];

    protected $casts = [
        'expires' => 'datetime',
    ];

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('expires', '>', now());
    }
}
