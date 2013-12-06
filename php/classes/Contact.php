<?php

class Contact
{

    private $fields;
    private $labels;

    public function __construct()
    {
        $this->fields = array('name', 'email', 'subject', 'message');
        $this->labels = array(
            'name'    => 'Nom',
            'email'   => 'Adresse mail',
            'subject' => 'Sujet',
            'message' => 'Message'
        );
    }

    /**
     * Traite une demande de contact et renvoie une réponse JSON
     */
    public function handleRequest()
    {
        // Contexte
        if (empty($_POST['action']) || $_POST['action'] != 'contact')
        {
            return false;
        }
        $answer = array(
            'errors'  => array(),
            'message' => array()
        );

        // Récupération des champs requis
        $fields = array();
        foreach ($this->fields as $field)
        {
            if (empty($_POST[$field]))
            {
                $answer['errors'][$field] = 'Ce champ est requis';
            }
            else
            {
                $fields[$field] = htmlentities($_POST[$field], ENT_QUOTES, 'UTF-8');
            }
        }

        // Traitement
        if (count($answer['errors']) > 0)
        {
            $answer['message'] = 'Merci de renseigner les champs requis';
        }
        else
        {
            $answer['message'] = 'Merci!';
            $template          = $this->getMailTemplate($fields);
            $headers           = array(
                'From: no-reply@' . trim($_SERVER['HTTP_HOST'], '/'),
                'MIME-Version: 1.0',
                'Content-type: text/html; charset=utf-8'
            );
            $subject           = 'Formulaire de contact ' . $_SERVER['HTTP_HOST'];
            mail(EMAIL, $subject, $template, implode("\r\n", $headers));
        }

        return $answer;
    }

    /**
     * Récupère un template de mail
     * @param Array $fields
     * @return String
     */
    private function getMailTemplate($fields)
    {
        $lines = array('<table>');
        foreach ($fields as $field => $value)
        {
            $lines[] = '<tr><td>' . $this->labels[$field] . '</td><td>' . htmlentities($value, ENT_QUOTES, 'UTF-8') . '</td></tr>';
        }
        $lines[] = '</table>';
        return implode("\r\n", $lines);
    }

}
