--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`id`, `first_name`, `last_name`, `email`, `password`) VALUES
(109, 'Sam', 'Chicotte', 'SamChicou@gmail.com', '123vivatamere'),
(184, 'Adam', 'Rhazi', 'chuisbougousse', 'amiright'),
(466, 'Couscous', 'Jitan', 'jaimelesxged@gmail.ca', 'zizidur'),
(927, 'Hakim', 'Hakim', 'Hakim', 'Hakim');

--
-- Déchargement des données de la table `docteur`
--

INSERT INTO `docteur` (`id`, `first_name`, `last_name`, `email`, `password`, `phone_number`) VALUES
(123, 'Zoubaidi', 'Momo', 'MoBaidi@gmail.doctor', 'mobaidi', '098765432');

--
-- Déchargement des données de la table `rdv`
--

INSERT INTO `rdv` (`type`, `client_id`, `docteur_id`, `starttime`, `endtime`) VALUES
('examen de dentition', 927, 123, '2022-02-18 17:34:59', '2022-02-18 17:34:59');
