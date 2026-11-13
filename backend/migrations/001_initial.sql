
CREATE TABLE audits (
	id SERIAL NOT NULL,
	actor VARCHAR(160) NOT NULL,
	action VARCHAR(180) NOT NULL,
	status_code INTEGER NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
)

;


CREATE TABLE comparison_studies (
	id SERIAL NOT NULL,
	code VARCHAR(40) NOT NULL,
	name VARCHAR(140) NOT NULL,
	context VARCHAR(1000) NOT NULL,
	source_file VARCHAR(140) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (code)
)

;


CREATE TABLE users (
	id SERIAL NOT NULL,
	email VARCHAR(160) NOT NULL,
	name VARCHAR(80) NOT NULL,
	role VARCHAR(20) NOT NULL,
	password_hash VARCHAR(250) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (email)
)

;


CREATE TABLE concepts (
	id SERIAL NOT NULL,
	study_id INTEGER NOT NULL,
	code VARCHAR(40) NOT NULL,
	title VARCHAR(100) NOT NULL,
	medium VARCHAR(100) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (study_id, code),
	FOREIGN KEY(study_id) REFERENCES comparison_studies (id)
)

;


CREATE TABLE ranking_runs (
	id SERIAL NOT NULL,
	name VARCHAR(140) NOT NULL,
	study_id INTEGER NOT NULL,
	ridge DOUBLE PRECISION NOT NULL,
	repeats INTEGER NOT NULL,
	seed INTEGER NOT NULL,
	status VARCHAR(20) NOT NULL,
	snapshot JSON NOT NULL,
	result JSON NOT NULL,
	error VARCHAR(600) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (name),
	FOREIGN KEY(study_id) REFERENCES comparison_studies (id)
)

;


CREATE TABLE pair_counts (
	id SERIAL NOT NULL,
	study_id INTEGER NOT NULL,
	left_id INTEGER NOT NULL,
	right_id INTEGER NOT NULL,
	left_wins INTEGER NOT NULL,
	right_wins INTEGER NOT NULL,
	source VARCHAR(160) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (study_id, left_id, right_id),
	FOREIGN KEY(study_id) REFERENCES comparison_studies (id),
	FOREIGN KEY(left_id) REFERENCES concepts (id),
	FOREIGN KEY(right_id) REFERENCES concepts (id)
)

;


CREATE TABLE review_proposals (
	id SERIAL NOT NULL,
	name VARCHAR(140) NOT NULL,
	run_id INTEGER NOT NULL,
	left_id INTEGER NOT NULL,
	right_id INTEGER NOT NULL,
	extra_votes INTEGER NOT NULL,
	rationale VARCHAR(1600) NOT NULL,
	status VARCHAR(20) NOT NULL,
	reviewer_note VARCHAR(1000) NOT NULL,
	reviewed_by VARCHAR(140) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (name),
	FOREIGN KEY(run_id) REFERENCES ranking_runs (id),
	FOREIGN KEY(left_id) REFERENCES concepts (id),
	FOREIGN KEY(right_id) REFERENCES concepts (id)
)

;
