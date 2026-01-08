CREATE TABLE id_counters (
  prefix      TEXT PRIMARY KEY,
  last_number BIGINT NOT NULL
);

INSERT INTO id_counters (prefix, last_number) VALUES
  ('BOOK',   0),
  ('OFFER',  0),
  ('BRATE',  0),
  ('BACT',   0),
  ('PAY',    0),
  ('TRANSD', 0),
  ('TRANSL', 0),
  ('CUST',   0),
  ('CADDR',  0),
  ('CRATE',  0),
  ('ADDR',   0),  
  ('HMAID',  0),
  ('HAVAIL', 0),
  ('HRATE',  0),
  ('HPERF',  0),
  ('HVIO',   0),
  ('HEARN',  0),
  ('ADMIN',  0),
  ('AUTH',   0),
  ('OTP',    0);
