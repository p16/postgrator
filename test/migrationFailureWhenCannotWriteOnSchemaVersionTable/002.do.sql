CREATE TABLE test_table (
	name 	VARCHAR(50)
);

-- added to cause the insert into schemaversion to fail
INSERT INTO schemaversion
  (version, name, md5, run_at)
  VALUES
  (2, 'do', 'somestring', NOW())
;