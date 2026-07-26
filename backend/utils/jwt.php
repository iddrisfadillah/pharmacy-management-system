<?php

class JWT
{
    private static $secret = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS";

    public static function generate($payload)
    {
        $header = [
            "alg" => "HS256",
            "typ" => "JWT"
        ];

        $header = self::base64UrlEncode(json_encode($header));
        $payload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            "sha256",
            $header . "." . $payload,
            self::$secret,
            true
        );

        $signature = self::base64UrlEncode($signature);

        return $header . "." . $payload . "." . $signature;
    }

  public static function verify($token)
{
    $parts = explode(".", $token);

    if (count($parts) != 3) {
        return false;
    }

    list($header, $payload, $signature) = $parts;

    $expected = self::base64UrlEncode(
        hash_hmac(
            "sha256",
            $header . "." . $payload,
            self::$secret,
            true
        )
    );

    if (!hash_equals($expected, $signature)) {
        return false;
    }

    $payload = json_decode(
        base64_decode(strtr($payload, '-_', '+/')),
        true
    );

    // Check if the token has expired
    if (isset($payload["exp"]) && $payload["exp"] < time()) {
        return false;
    }

    return $payload;
}

    private static function base64UrlEncode($data)
    {
        return rtrim(
            strtr(base64_encode($data), '+/', '-_'),
            '='
        );
    }
}