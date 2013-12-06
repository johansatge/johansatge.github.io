<?php

class Flickr
{

    private $api_key;
    private $cachedir;

    /**
     * Constructeur de l'API
     * @param String $api_key
     */
    public function __construct($api_key)
    {
        $this->api_key  = $api_key;
        $this->cachedir = rtrim(dirname(__FILE__), '/') . '/../flickr-cache';
        if (!is_readable($this->cachedir))
        {
            mkdir($this->cachedir, 0775);
        }
    }

    /**
     * Récupère l'ID d'un utilisateur à partir de son email
     * @param String $email
     * @return String|Boolean
     */
    public function getUserIDByEmail($email)
    {
        $user = $this->get('flickr.people.findByEmail&find_email=' . $email);
        return !empty($user['user']['id']) ? $user['user']['id'] : false;
    }

    /**
     * Récupère les photos d'un utilisateur
     * @param String $user_id
     * @param int $per_page
     * @return Array
     */
    public function getUserPhotos($user_id, $per_page)
    {
        $cache_key = '/photos/' . $user_id . '/' . $per_page . '-per-page/photos';
        $photos    = $this->getCache($cache_key);
        if ($photos !== false)
        {
            return $photos;
        }
        set_time_limit(120);
        $photos     = array();
        $raw_photos = $this->get('flickr.people.getPublicPhotos&user_id=' . $user_id . '&per_page=' . $per_page . '&page=1');
        if (!empty($raw_photos['photos']['photo']) && is_array($raw_photos['photos']['photo']))
        {
            foreach ($raw_photos['photos']['photo'] as $photo)
            {
                $data = $this->getPhoto($photo['id']);
                if ($data !== false)
                {
                    $photos[] = $data;
                }
            }
        }
        $this->writeCache($photos, $cache_key);
        return $photos;
    }

    /**
     * Récupère les informations d'une photo
     * @param int $photo_id
     * @return Array|Boolean
     */
    public function getPhoto($photo_id)
    {
        // Récupération des infos
        $info = $this->get('flickr.photos.getInfo&photo_id=' . $photo_id);
        if (empty($info['photo']))
        {
            return false;
        }
        $info = $info['photo'];

        // Récupération des tailles
        $sizes = array('75x75' => 's', '150x150' => 'q', '100' => 't', '240' => 'm', '320' => 'n', 'medium' => '', '640' => 'z', '800' => 'c', '1024' => 'b', 'original' => 'o');
        foreach ($sizes as $size_name => $size)
        {
            $sizes[$size_name] = sprintf('http://farm%s.staticflickr.com/%s/%s_%s%s.jpg', $info['farm'], $info['server'], $info['id'], $info['secret'], (!empty($size) ? '_' . $size : ''));
        }

        // Récupération des exifs
        $raw_exifs = $this->get('flickr.photos.getExif&photo_id=' . $photo_id);
        $exifs     = array();
        if (!empty($raw_exifs['photo']['exif']))
        {
            foreach ($raw_exifs['photo']['exif'] as $exif)
            {
                $exifs[$exif['tag']] = !empty($exif['raw']['_content']) ? $exif['raw']['_content'] : '';
            }
        }

        // Renvoi des données
        return array(
            'id'          => $photo_id,
            'title'       => !empty($info['title']['_content']) ? $info['title']['_content'] : '',
            'description' => !empty($info['description']['_content']) ? $info['description']['_content'] : '',
            'upload_date' => $info['dateuploaded'],
            'url'         => !empty($info['owner']['nsid']) ? 'http://www.flickr.com/photos/' . $info['owner']['nsid'] . '/' . $photo_id : '',
            'src'         => $sizes,
            'exifs'       => $exifs
        );
    }

    /**
     * Lance une requête vers l'API Flickr
     * @param String $method
     * @return Array
     */
    private function get($method)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, 'http://ycpi.api.flickr.com/services/rest/?method=' . $method . '&format=json&api_key=' . $this->api_key);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($curl);
        curl_close($curl);
        if (strpos($result, 'jsonFlickrApi(') === 0)
        {
            $result = str_replace('jsonFlickrApi(', '', $result);
            $result = substr($result, 0, strlen($result) - 1);
            return json_decode($result, true);
        }
        return array();
    }

    /**
     * Ecrit le cache
     * @param mixed $values
     * @param String $filename
     * @return Boolean
     */
    private function writeCache($values, $filename)
    {
        $subdirs = explode('/', $filename);
        if (count($subdirs) > 1)
        {
            array_pop($subdirs);
            $test_path = $this->cachedir . implode('/', $subdirs);
            if (!is_readable($test_path))
            {
                $mkdir = mkdir($test_path, 0775, true);
                if (!$mkdir)
                {
                    return false;
                }
                else
                {
                    chmod($test_path, 0775);
                }
            }
        }
        $path_file = $this->cachedir . $filename . '.cache';
        if ($fp = fopen($path_file, 'w+b'))
        {
            ini_set('memory_limit', '128M');
            fwrite($fp, serialize($values));
            fclose($fp);
            chmod($path_file, 0775);
            return true;
        }
        return false;
    }

    /**
     * Récupère un cache
     * @param String $filename
     * @param int $ttl
     * @return bool|mixed
     */
    private function getCache($filename, $ttl = 21600)
    {
        $path_file = $this->cachedir . $filename . '.cache';
        if (!is_readable($path_file))
        {
            return false;
        }
        if (!$fp = fopen($path_file, 'rb'))
        {
            return false;
        }
        $cache = false;
        if (filesize($path_file) > 0)
        {
            $now  = time();
            $time = filemtime($path_file);
            if ($time + $ttl >= $now)
            {
                $cache = unserialize(fread($fp, filesize($path_file)));
            }
        }
        fclose($fp);
        return $cache;
    }
}
