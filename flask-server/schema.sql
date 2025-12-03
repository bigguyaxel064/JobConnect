SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS react_flask_db
CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
USE react_flask_db;

CREATE TABLE user_account (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(155) NOT NULL,
        last_name VARCHAR(155) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(155) NOT NULL UNIQUE,
        phone VARCHAR(55),
        cv VARCHAR(255),
        role ENUM('responsible', 'candidate') NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE company (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address VARCHAR(255),
        website VARCHAR(150),
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_company_name UNIQUE (name),
        CONSTRAINT fk_company_created_by
            FOREIGN KEY (created_by) REFERENCES user_account(id)
            ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE advertisement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        short_description VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        publish_date DATE NOT NULL,
        company_id INT NOT NULL,
        location VARCHAR(155),
        employment_type ENUM('CDI','CDD','Alternance', 'Stage'),
        work_mode ENUM('Site','Hybride','Remote'),
        salary_min INT,
        salary_max INT,
        required_experience VARCHAR(155),
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ads_company
            FOREIGN KEY (company_id) REFERENCES company(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_ads_created_by
            FOREIGN KEY (created_by) REFERENCES user_account(id)
            ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE application (
        id INT AUTO_INCREMENT PRIMARY KEY,
        person_id INT NOT NULL,
        advertisement_id INT NOT NULL,
        handled_by INT DEFAULT NULL,
        apply_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status ENUM('Envoyée', 'Review', 'Acceptée', 'Refusée') NOT NULL DEFAULT 'Envoyée',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_app_person_ad UNIQUE (person_id, advertisement_id),
        CONSTRAINT fk_app_person
            FOREIGN KEY (person_id) REFERENCES user_account(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_app_ad
            FOREIGN KEY (advertisement_id) REFERENCES advertisement(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_app_handled_by
            FOREIGN KEY (handled_by) REFERENCES user_account(id)
            ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE application_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        actor_id INT DEFAULT NULL,
        status ENUM('Envoyée','Review','Acceptée','Refusée'),
        candidate_last_name VARCHAR(155) NOT NULL,
        candidate_first_name VARCHAR(155) NOT NULL,
        cv VARCHAR(255), 
        cover_letter VARCHAR(3000), 
        note TEXT,
        sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_app_logs_app
            FOREIGN KEY (application_id) REFERENCES application(id)
            ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_app_logs_actor
            FOREIGN KEY (actor_id) REFERENCES user_account(id)
            ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_account (first_name, last_name, email, phone, cv, role, password_hash, is_admin) VALUES
        ("Alice", "Martin", "alice.martin@example.com", "+33 6 12 34 56 78", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Bastien", "Lopez", "bastien.lopez@example.com", "+33 6 98 76 54 32", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Chloe", "Durand", "chloe.durand@example.com", "+33 6 11 22 33 44", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("David", "Nguyen", "david.nguyen@example.com", "+33 6 55 66 77 88", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Emma", "Moreau", "emma.moreau@example.com", "+33 6 99 88 77 66", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Fabrice", "Bernard", "fabrice.bernard@example.com", "+33 6 44 55 66 77", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Giselle", "Petit", "giselle.petit@example.com", "+33 6 33 22 11 00", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Hugo", "Leclerc", "hugo.leclerc@example.com", "+33 6 12 98 76 54", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Isabelle", "Roche", "isabelle.roche@example.com", "+33 6 77 88 99 00", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Super", "admin", "admin@jobconnect.fr", "+33 6 00 11 22 33", '/uploads/cv.pdf', "responsible", "testtest", TRUE),
        ("Julien", "Faure", "julien.faure@example.com", "+33 6 21 43 65 87", '/uploads/cv.pdf', "candidate", "testtest", FALSE),
        ("Paul", "Dupont", "paul.dupont@redpixel.com", "+33 6 10 20 30 40", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Sophie", "Leroy", "sophie.leroy@cloudnest.com", "+33 6 11 22 33 44", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Marc", "Garnier", "marc.garnier@ecologic.com", "+33 6 12 23 34 45", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Claire", "Benoit", "claire.benoit@nextgenit.com", "+33 6 13 24 35 46", '/uploads/cv.pdf', "responsible", "testtest", FALSE),
        ("Lucas", "Perrot", "lucas.perrot@urbansoft.com", "+33 6 14 25 36 47", '/uploads/cv.pdf', "responsible", "testtest", FALSE);

INSERT INTO company (name, address, website, created_by) VALUES
        ("BlueWave Tech", "12 Rue de l'Innovation, Paris", "https://bluewave.example.com", 6),
        ("GreenFields SA", "48 Avenue des Champs, Lyon", "https://greenfields.example.com", 6),
        ("NorthStar Recruiting", "3 Boulevard du Marché, Lille", "https://northstar.example.com", 7),
        ("RedPixel Studio", "22 Rue des Arts, Marseille", "https://redpixel.example.com", 12),
        ("CloudNest Solutions", "5 Avenue du Ciel, Toulouse", "https://cloudnest.example.com", 13),
        ("EcoLogic Partners", "19 Rue Verte, Nantes", "https://ecologic.example.com", 14),
        ("NextGen IT", "77 Avenue du Futur, Bordeaux", "https://nextgenit.example.com", 15),
        ("UrbanSoft", "101 Rue de la Ville, Nice", "https://urbansoft.example.com", 16);

INSERT INTO advertisement (
        title, short_description, description, publish_date, company_id,
        location, employment_type, work_mode, salary_min, salary_max, required_experience, created_by
) VALUES
        ("Frontend Developer (React)", "UI moderne avec React", "Vous rejoindrez une équipe dynamique pour concevoir et développer des interfaces utilisateur modernes et performantes avec React et Vite. Vous participerez à la création de composants réutilisables, à l'intégration d'APIs REST, à l'optimisation des performances et à la mise en place de tests unitaires. Vous serez force de proposition sur l'architecture front-end et la veille technologique. Une expérience sur les outils de build modernes (Vite, Webpack), la gestion d'état (Redux, Context API) et les bonnes pratiques d'accessibilité est un plus. Travail en méthode agile, participation aux revues de code et à la documentation technique.", "2025-09-01", 1, 'Paris', 'CDI', 'Hybride', 40000, 50000, '2+ years', 6),
        ("Backend Python (Flask)", "API REST en Flask", "Vous serez responsable du développement et de la maintenance d'APIs REST robustes avec Flask. Vous interviendrez sur la conception de la base de données (MySQL), l'intégration de services externes, la gestion de la sécurité (authentification, autorisations) et la documentation des endpoints. Vous participerez à l'automatisation des tests, au déploiement continu (Docker, CI/CD) et à la résolution des incidents de production. Une bonne connaissance de SQL, des ORM (SQLAlchemy) et des principes SOLID est attendue. Travail en équipe avec les développeurs front-end et les DevOps.", "2025-08-20", 1, 'Paris', 'CDI', 'Site', 42000, 55000, '3+ years', 6),
        ("Data Analyst Junior", "Analyse SQL & visualisation", "Vous accompagnerez l'équipe data dans l'analyse de données issues de différentes sources (bases SQL, fichiers, APIs). Vous serez chargé(e) de rédiger des requêtes SQL complexes, de produire des rapports et des tableaux de bord (Power BI, Tableau, Excel) et de participer à la modélisation des données. Vous contribuerez à la qualité des données, à la détection d'anomalies et à la mise en place de KPIs. Curiosité, rigueur et esprit d'analyse sont essentiels. Une première expérience en data visualisation et en automatisation de reporting est appréciée.", "2025-07-15", 2, 'Lyon', 'CDD', 'Site', 30000, 38000, '1+ years', 6),
        ("Product Manager", "Coordination équipes produit", "En tant que Product Manager, vous piloterez la roadmap produit, coordonnerez les équipes techniques et business, et serez garant(e) de la livraison de nouvelles fonctionnalités à forte valeur ajoutée. Vous recueillerez les besoins utilisateurs, prioriserez les évolutions, animerez les ateliers de conception et suivrez les indicateurs de performance. Vous travaillerez en méthode agile (Scrum/Kanban), rédigerez les user stories et assurerez la communication entre les parties prenantes. Leadership, organisation et sens du client sont indispensables.", "2025-06-10", 2, 'Lyon', 'CDI', 'Hybride', 50000, 65000, '5+ years', 6),
        ("DevOps Engineer", "CI/CD, Docker, K8s", "Vous serez en charge de la mise en place et de l'amélioration des pipelines CI/CD, du déploiement et de la supervision des applications sur des environnements Docker et Kubernetes. Vous interviendrez sur l'automatisation des tâches, la gestion des configurations, la sécurité des déploiements et la résolution des incidents d'infrastructure. Vous travaillerez en étroite collaboration avec les équipes de développement pour garantir la qualité, la scalabilité et la résilience des systèmes. Maîtrise de GitLab CI, Helm, Prometheus et bonnes pratiques DevOps requises.", "2025-09-10", 3, 'Lille', 'CDI', 'Remote', 48000, 70000, '4+ years', 7),
        ("Technical Recruiter", "Sourcing & entretiens", "Vous serez responsable du sourcing, de la qualification et du suivi des candidats pour des postes techniques variés. Vous rédigerez et publierez les offres, mènerez les entretiens, évaluerez les compétences et accompagnerez les managers dans le processus de recrutement. Vous participerez à la stratégie de marque employeur, à la gestion des viviers de talents et à l'amélioration continue des process RH. Excellentes capacités relationnelles, sens de l'écoute et connaissance des métiers IT sont attendus.", "2025-05-05", 3, 'Lille', 'CDI', 'Site', 32000, 42000, '2+ years', 7),
        ("Fullstack JS Developer", "Node.js & React", "En tant que développeur Fullstack JS, vous serez responsable de la conception, du développement et de la maintenance d'applications web performantes et évolutives. Vous travaillerez sur des projets innovants utilisant Node.js côté serveur et React côté client, en collaboration avec des équipes multidisciplinaires (UX, DevOps, QA). Vous participerez à l'architecture logicielle, à la mise en place de tests automatisés, à l'intégration continue et à l'amélioration continue des processus de développement. Une forte capacité à résoudre des problèmes complexes et à communiquer efficacement est attendue.", "2025-10-01", 4, 'Marseille', 'CDI', 'Hybride', 41000, 52000, '3+ years', 12),
        ("UX/UI Designer", "Design d'interfaces", "Nous recherchons un(e) UX/UI Designer passionné(e) pour créer des expériences utilisateurs exceptionnelles. Vous serez chargé(e) de concevoir des wireframes, prototypes interactifs et interfaces graphiques pour des applications web et mobiles. Vous collaborerez étroitement avec les équipes produit et développement pour garantir la cohérence visuelle et l'ergonomie. Vous devrez également mener des tests utilisateurs, analyser les retours et itérer sur vos designs pour optimiser l'expérience. Maîtrise des outils Figma, Adobe XD ou Sketch indispensable.", "2025-10-05", 4, 'Marseille', 'CDD', 'Remote', 35000, 42000, '2+ years', 12),
        ("Cloud Engineer", "Déploiement cloud AWS", "En tant qu'ingénieur Cloud, vous serez en charge de la conception, du déploiement et de la gestion d'infrastructures cloud sur AWS. Vous interviendrez sur l'automatisation des déploiements (Terraform, Ansible), la sécurité, la supervision et l'optimisation des coûts. Vous travaillerez en étroite collaboration avec les équipes DevOps et développement pour garantir la scalabilité et la résilience des plateformes. Une expérience sur les architectures serverless, les bases de données managées et la migration cloud est un plus.", "2025-10-10", 5, 'Toulouse', 'CDI', 'Remote', 47000, 60000, '4+ years', 13),
        ("QA Tester", "Tests automatisés", "Vous rejoindrez notre équipe QA pour concevoir, écrire et exécuter des plans de tests automatisés sur nos applications web. Vous serez responsable de la qualité logicielle, de la détection des bugs et de la rédaction de rapports détaillés. Vous participerez à l'intégration continue, à la mise en place de tests de régression et à l'amélioration des processus de validation. Une bonne connaissance de Selenium, Cypress ou d'outils similaires est requise. Rigueur, autonomie et esprit d'équipe sont essentiels.", "2025-10-12", 5, 'Toulouse', 'CDD', 'Site', 32000, 37000, '1+ years', 13),
        ("Business Analyst", "Analyse métier", "En tant que Business Analyst, vous serez le lien entre les équipes métier et technique. Vous recueillerez les besoins, rédigerez les spécifications fonctionnelles et accompagnerez la mise en œuvre des solutions. Vous animerez des ateliers, réaliserez des analyses d'impacts et assurerez le suivi des évolutions. Une expérience dans la gestion de projets IT, la rédaction de cahiers des charges et la conduite du changement est attendue. Sens de l'écoute, esprit d'analyse et capacité de synthèse indispensables.", "2025-10-15", 6, 'Nantes', 'CDI', 'Hybride', 43000, 51000, '3+ years', 14),
        ("Support IT", "Assistance utilisateurs", "Vous intégrerez notre équipe support pour assurer l'assistance technique auprès des utilisateurs internes et externes. Vous traiterez les tickets, résoudrez les incidents matériels et logiciels, et participerez à la formation des utilisateurs. Vous serez également amené(e) à rédiger des procédures et à contribuer à l'amélioration continue du service. Une bonne connaissance des environnements Windows, Mac et Linux est requise. Sens du service, pédagogie et réactivité sont attendus.", "2025-10-18", 6, 'Nantes', 'CDD', 'Site', 28000, 34000, '1+ years', 14),
        ("Mobile Developer", "Apps iOS/Android", "Vous participerez au développement d'applications mobiles innovantes sur iOS et Android. Vous serez impliqué(e) dans toutes les phases du projet : conception, développement, tests, déploiement et maintenance. Vous travaillerez avec des technologies natives (Swift, Kotlin) et/ou hybrides (React Native, Flutter). Une expérience en publication sur les stores et en intégration d'API tierces est un plus. Créativité, autonomie et veille technologique sont des atouts majeurs.", "2025-10-20", 7, 'Bordeaux', 'CDI', 'Remote', 45000, 58000, '3+ years', 15),
        ("SEO Specialist", "Optimisation SEO", "Votre mission sera d'optimiser le référencement naturel de nos sites web. Vous réaliserez des audits techniques, proposerez des recommandations, rédigerez des contenus optimisés et assurerez le suivi des performances (Google Analytics, Search Console). Vous travaillerez en lien avec les équipes marketing et développement pour améliorer la visibilité et le trafic organique. Maîtrise des outils SEO, capacité d'analyse et rédaction irréprochable sont indispensables.", "2025-10-22", 7, 'Bordeaux', 'CDD', 'Remote', 33000, 39000, '2+ years', 15),
        ("Data Engineer", "ETL & pipelines", "Vous serez responsable de la conception, du développement et de la maintenance de pipelines de données (ETL) robustes et évolutifs. Vous interviendrez sur la collecte, la transformation et le stockage de données volumineuses, en garantissant leur qualité et leur sécurité. Vous travaillerez avec des outils comme Airflow, Talend, Spark ou Kafka, et collaborerez avec les Data Scientists pour la mise à disposition des datasets. Esprit analytique, rigueur et maîtrise du SQL sont essentiels.", "2025-10-25", 8, 'Nice', 'CDI', 'Site', 48000, 62000, '4+ years', 16),
        ("Community Manager", "Gestion réseaux sociaux", "Vous animerez et développerez la communauté sur les réseaux sociaux (Facebook, Twitter, LinkedIn, Instagram). Vous créerez des contenus engageants, planifierez des campagnes, modérerez les échanges et analyserez les performances. Vous serez force de proposition pour accroître la notoriété de la marque et fidéliser les utilisateurs. Créativité, aisance rédactionnelle et maîtrise des outils de gestion de communauté sont attendues.", "2025-10-28", 8, 'Nice', 'CDD', 'Remote', 30000, 36000, '1+ years', 16),
        ("Cybersecurity Analyst", "Sécurité informatique", "Vous serez chargé(e) d'identifier, d'analyser et de traiter les risques liés à la sécurité des systèmes d'information. Vous réaliserez des audits, mettrez en place des politiques de sécurité, suivrez les alertes et participerez à la gestion des incidents. Vous formerez les équipes aux bonnes pratiques et assurerez une veille sur les menaces émergentes. Maîtrise des outils de sécurité, rigueur et sens de la confidentialité sont indispensables.", "2025-11-01", 5, 'Paris', 'CDI', 'Site', 50000, 67000, '5+ years', 12),
        ("Project Coordinator", "Coordination projets", "Vous accompagnerez la coordination de projets IT, du cadrage à la livraison. Vous assurerez le suivi des plannings, la gestion des ressources, la communication entre les parties prenantes et la rédaction des comptes-rendus. Vous participerez à l'identification des risques et à la mise en place d'actions correctives. Organisation, sens du relationnel et capacité à travailler en équipe sont essentiels.", "2025-11-03", 4, 'Paris', 'CDD', 'Hybride', 37000, 44000, '2+ years', 12),
        ("AI Engineer", "Modèles ML/IA", "Vous développerez et déploierez des modèles d'intelligence artificielle pour répondre à des problématiques métiers variées. Vous participerez à la collecte et la préparation des données, à la conception d'algorithmes, à l'entraînement et à l'optimisation des modèles. Vous travaillerez en équipe avec des Data Scientists et des développeurs pour intégrer les solutions dans les applications existantes. Maîtrise de Python, TensorFlow ou PyTorch requise.", "2025-11-05", 4, 'Lyon', 'CDI', 'Remote', 52000, 75000, '4+ years', 13),
        ("Content Writer", "Rédaction web", "Vous serez en charge de la rédaction de contenus variés (articles, pages web, newsletters) optimisés pour le SEO. Vous travaillerez en lien avec les équipes marketing et produit pour valoriser l'expertise de l'entreprise et générer du trafic qualifié. Excellente orthographe, créativité et capacité à vulgariser des sujets techniques sont attendues. Une expérience en rédaction web et une sensibilité au référencement naturel sont un plus.", "2025-11-07", 6, 'Lyon', 'CDD', 'Remote', 27000, 32000, '1+ years', 13),
        ("Network Engineer", "Réseaux d'entreprise", "Vous assurerez la gestion, la maintenance et l'évolution des réseaux d'entreprise. Vous interviendrez sur l'installation, la configuration et le dépannage des équipements (switches, routeurs, firewalls). Vous participerez à la sécurisation des infrastructures, à la gestion des accès et à la supervision du réseau. Autonomie, rigueur et bonnes connaissances des protocoles réseau sont indispensables.", "2025-11-10", 4, 'Marseille', 'CDI', 'Site', 46000, 59000, '3+ years', 12),
        ("Product Owner", "Gestion de backlog", "Vous serez responsable de la gestion du backlog produit, de la priorisation des fonctionnalités et de la rédaction des user stories. Vous travaillerez en étroite collaboration avec les équipes de développement, design et business pour garantir la livraison de solutions à forte valeur ajoutée. Sens de l'organisation, leadership et expérience en méthodologie agile sont requis.", "2025-11-12", 5, 'Toulouse', 'CDI', 'Hybride', 48000, 63000, '4+ years', 13);

INSERT INTO application (person_id, advertisement_id, handled_by, apply_date, status) VALUES
        (1, 1, 6, "2025-09-02 10:15:00", "Envoyée"),
        (2, 2, 6, "2025-08-21 14:30:00", "Review"),
        (3, 5, 7, "2025-09-12 09:00:00", "Acceptée");

INSERT INTO application_log (application_id, actor_id, status, candidate_last_name, candidate_first_name, cv, cover_letter, note, sent_at) VALUES
        (1, 6, "Envoyée", "Martin", "Alice", '/uploads/cv.pdf', "Bonjour, Je souhaite postuler pour le poste Frontend Developer. Vous trouverez mon CV en pièce jointe.", "Candidature initiale envoyée par candidate", "2025-09-02 10:16:00"),
        (2, 6, "Review", "Lopez", "Bastien", '/uploads/cv.pdf', "Bonjour, Je vous transmet ma candidature pour Backend Python. Merci de me tenir informé.", "Candidature initiale envoyée par candidate", "2025-08-22 09:00:00"),
        (3, 7, "Acceptée", "Durand", "Chloe", '/uploads/cv.pdf', "Bonjour, Merci pour votre retour positif. Je suis ravie d'accepter l'offre.", "Réponse candidate après entretien", "2025-09-13 11:45:00");
