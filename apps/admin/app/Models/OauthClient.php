<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OauthClient extends Model
{
    use SoftDeletes;

    protected $table = 'oauth_clients';
    protected $primaryKey = 'client_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'client_id',
        'client_secret',
        'redirect_uri',
        'grant_types',
        'scope',
        'user_id',
        'client_name',
        'is_active',
    ];

    protected $hidden = ['client_secret'];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function accessTokens(): HasMany
    {
        return $this->hasMany(OauthAccessToken::class, 'client_id', 'client_id');
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(OauthRefreshToken::class, 'client_id', 'client_id');
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', 1)->whereNull('deleted_at');
    }
}
