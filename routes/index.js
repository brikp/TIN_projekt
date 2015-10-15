var express = require('express');
var router = express.Router();
var dialog = require('dialog');

var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'test'
});

var userlist = [];
var loggedIn;

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.redirect('/noauth');

});

router.get('/user/dodaj', function(req, res, next) {
	
	res.render('userAdd', { title: 'Rejestracja' });

});

router.post('/user/dodaj', function(req, res, next) {

	if (!req.body.login || !req.body.haslo) {
		dialog.info('Żadne pole nie może być puste.', 'Wprowadź dane!', function(err) {});
	}
	else {
		var dodawanie = 'INSERT INTO users (username, password) VALUES (\''+req.body.login+'\', \''+req.body.haslo+'\')';
	   // var dodawanie = 'INSERT INTO ksiazki (tytul, id_autora) VALUES (\'tarzan\', 2)';
	    connection.query(dodawanie, function(err, result) {
			if (err) throw err;
			dialog.info('Rejestracja udana, możesz się zalogować.', 'Sukces!', function(err) {});
			res.redirect('/login')
		});
	}
});

router.get('/ksiazki', function(req, res, next) {

	//pobranie ksiazek z bazy i przekazanie listy do widoku
	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var ksiazki = [];
	var osoby = [];
	var osoba;

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby[i] = {
				id: rows[i].id,
				nazwa: rows[i].imie + ' ' + rows[i].nazwisko
			}
		}
		connection.query('SELECT * FROM ksiazki', function(err, rows2, fields) {
			if (err) throw err;
			for (var i = 0; i < rows2.length; i++) {
				var id = parseInt(rows2[i].id_autora, 10);
				for (var j = 0; j < osoby.length; j++)
					if (id == osoby[j].id)
						osoba = osoby[j];
				//console.log('Tytul: ' + result['tytul']);
				ksiazki[i] = {
					id: rows2[i].id,
					autor: osoba.nazwa,
					tytul: rows2[i].tytul,
					ilosc: rows2[i].ilosc
				}
			}
			res.render('ksiazki', { 
				title: 'Lista książek',
				ksiazki: ksiazki
			});
		});
	});
	
});

router.get('/osoby', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var osoby = [];

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby.push(rows[i]);
		}
		res.render('osoby', { 
			title: 'Lista osób',
			osoby: osoby
		});
	});

});

router.get('/klienci', function(req, res, next) {
	
	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	//pobranie ksiazek z bazy i przekazanie listy do widoku

	var klienci = [];
	var osoby = [];

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby[i] = {
				id: rows[i].id,
				nazwa: rows[i].imie + ' ' + rows[i].nazwisko
			}
		}

		connection.query('SELECT * FROM klienci', function(err, rows2, fields) {
			if (err) throw err;
			for (var i = 0; i < rows2.length; i++) {
				//console.log('Tytul: ' + result['tytul']);
				klienci[i] = {
					id: rows2[i].id,
					id_osoby: osoby[i].id,
					nazwa: osoby[i].nazwa,
					telefon: rows2[i].telefon
				}
			}
			//console.log(klienci);
			res.render('klienci', { 
				title: 'Lista klientów',
				klienci: klienci
			});
		});
	});



});

router.get('/wypozyczenia', function(req, res, next) {

	//pobranie ksiazek z bazy i przekazanie listy do widoku

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var wypozyczenia = [];
	var osoby = [];
	var ksiazki = [];
	var klienci = [];

	connection.query('SELECT * FROM osoby', function(err, rows4, fields) {
		if (err) throw err;
		for (var i = 0; i < rows4.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby[i] = {
				id: rows4[i].id,
				nazwa: rows4[i].imie + ' ' + rows4[i].nazwisko
			}
		}

		//console.log(osoby);

		connection.query('SELECT * FROM klienci', function(err, rows, fields) {
			if (err) throw err;
			for (var i = 0; i < rows.length; i++) {
				var id_osoby = parseInt(rows[i].id_osoby, 10);
				var osoba;
				for (var j = 0; j < osoby.length; j++)
					if (id_osoby == osoby[j].id)
						osoba = osoby[j];
				//console.log('Tytul: ' + result['tytul']);
				klienci[i] = {
					id: rows[i].id,
					nazwa: osoba.nazwa
				}

			}
			//console.log(klienci);

			connection.query('SELECT * FROM ksiazki', function(err, rows2, fields) {
				if (err) throw err;
				for (var i = 0; i < rows2.length; i++) {
					ksiazki[i] = {
						id: rows2[i].id,
						tytul: rows2[i].tytul
					}
				}

				//console.log(ksiazki);

				connection.query('SELECT * FROM wypozyczenia', function(err, rows3, fields) {
					if (err) throw err;
					for (var i = 0; i < rows3.length; i++) {

						var id_ksiazki = parseInt(rows3[i].id_ksiazki, 10);
						var id_klienta = parseInt(rows3[i].id_klienta, 10);

						var klient, ksiazka;
						for (var j = 0; j < klienci.length; j++)
							if (id_klienta == klienci[j].id)
								klient = klienci[j];
						for (var j = 0; j < ksiazki.length; j++)
							if (id_ksiazki == ksiazki[j].id)
								ksiazka = ksiazki[j];
						//console.log('Tytul: ' + result['tytul']);
						wypozyczenia[i] = {
							id: rows3[i].id,
							ksiazka: ksiazka.tytul,
							klient: klient.nazwa
						}
					}
					res.render('wypozyczenia', { 
						title: 'Lista wypożyczeń',
						wypozyczenia: wypozyczenia
					});
				});
			});

		});
	});
});

// ---------------------------------------------------------------------------------------------------------------
// 														KSIAZKI
// ---------------------------------------------------------------------------------------------------------------

router.get('/ksiazka/:id', function(req, res, next) {

    var id = parseInt(req.param('id'), 10);

    if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}
    
    connection.query('SELECT * FROM ksiazki WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('ksiazka', { 
			title: 'Ksiazka',
			ksiazka: rows[0]
		});
	});

});
/*
router.get('/ksiazka/:id/edytuj', function(req, res, next) {
    
    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM ksiazki WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('ksiazkaEdit', { 
			title: 'Ksiazka',
			ksiazka: rows[0]
		});
	});

});

router.post('/ksiazka/:id/edytuj', function(req, res, next) {
    
    var id = parseInt(req.param('id'), 10);
    //req.body.tytul
    var zmiana = 'UPDATE ksiazki SET tytul=\''+req.body.tytul+'\' WHERE id='+id;
    connection.query(zmiana, function(err, result) {
		if (err) throw err;
		res.redirect('/ksiazki')
	});

});
*/
router.post('/ksiazka/:id/usun', function(req, res, next) {
    
	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    //req.body.tytul
    var kasowanie = 'DELETE FROM ksiazki WHERE id='+id;
    connection.query(kasowanie, function(err, result) {
		if (err) throw err;
		res.redirect('/ksiazki')
	});

});

router.get('/dodaj/ksiazke', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var autorzy = [];

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		
		for (var i = 0; i < rows.length; i++)
			autorzy[i] = {
				id: rows[i].id,
				nazwa: rows[i].imie + ' ' + rows[i].nazwisko
			}

		//console.log(autorzy);

		res.render('ksiazkaAdd', {
			title: 'Nowa książka',
			autorzy: autorzy
		});
	});
	
});

router.post('/ksiazka/dodaj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	if (!req.body.tytul || !req.body.nr_autora) {
		dialog.info('Żadne pole nie może być puste.', 'Wprowadź dane!', function(err) {});
	}
	else {
		console.log('Nr autora: ' + req.body.nr_autora)
	    var dodawanie = 'INSERT INTO ksiazki (tytul, id_autora, ilosc) VALUES (\''+req.body.tytul+'\', '+req.body.nr_autora+', 1)';
	   // var dodawanie = 'INSERT INTO ksiazki (tytul, id_autora) VALUES (\'tarzan\', 2)';
	    connection.query(dodawanie, function(err, result) {
			if (err) throw err;
			res.redirect('/ksiazki')
		});
	}
});

router.post('/ksiazka/:id/zwieksz', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    var ilosc;
    
    connection.query('SELECT * FROM ksiazki WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		ilosc = rows[0].ilosc;
		console.log(ilosc);

		ilosc += 1;
	
		var zmiana = 'UPDATE ksiazki SET ilosc='+ilosc+' WHERE id='+id;
	    connection.query(zmiana, function(err, result) {
			if (err) throw err;
			res.redirect('/ksiazki')
		});
	});

});

router.post('/ksiazka/:id/zmniejsz', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var id = parseInt(req.param('id'), 10);
    var ilosc;
    
    connection.query('SELECT * FROM ksiazki WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		ilosc = rows[0].ilosc;
		//console.log(ilosc);
		
		if (ilosc > 0) {
			ilosc -= 1;
			var zmiana = 'UPDATE ksiazki SET ilosc='+ilosc+' WHERE id='+id;
		    connection.query(zmiana, function(err, result) {
				if (err) throw err;
				res.redirect('/ksiazki')
			});
		}
	});

});

// ---------------------------------------------------------------------------------------------------------------
// 														OSOBY
// ---------------------------------------------------------------------------------------------------------------

router.get('/osoba/:id', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM osoby WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('osoba', { 
			title: 'Osoba',
			osoba: rows[0]
		});
	});

});

router.get('/osoba/:id/edytuj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM osoby WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('osobaEdit', { 
			title: 'Osoba',
			osoba: rows[0]
		});
	});

});

router.post('/osoba/:id/edytuj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	if (!req.body.imie || !req.body.nazwisko) {
		dialog.info('Żadne pole nie może być puste.', 'Wprowadź dane!', function(err) {});
	}
	else {
	    var id = parseInt(req.param('id'), 10);
	    //req.body.tytul
	    var zmiana = 'UPDATE osoby SET imie=\''+req.body.imie+'\', nazwisko=\''+req.body.nazwisko+'\' WHERE id='+id;
	    connection.query(zmiana, function(err, result) {
			if (err) throw err;
			res.redirect('/osoby')
		});
	}
});

router.post('/osoba/:id/usun', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    //req.body.tytul
    var kasowanie = 'DELETE FROM osoby WHERE id='+id;
    connection.query(kasowanie, function(err, result) {
		if (err) throw err;
		res.redirect('/osoby')
	});

});

router.get('/dodaj/osobe', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	res.render('osobaAdd', {title: 'Nowa osoba'});
});

router.post('/osoba/dodaj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	if (!req.body.imie || !req.body.nazwisko) {
		dialog.info('Żadne pole nie może być puste.', 'Wprowadź dane!', function(err) {});
	}
	else {
	    var dodawanie = 'INSERT INTO osoby (imie, nazwisko) VALUES (\''+req.body.imie+'\', \''+req.body.nazwisko+'\')';
	   // var dodawanie = 'INSERT INTO ksiazki (tytul, id_autora) VALUES (\'tarzan\', 2)';
	    connection.query(dodawanie, function(err, result) {
			if (err) throw err;
			res.redirect('/osoby')
		});
	}

});

// ---------------------------------------------------------------------------------------------------------------
// 														KLIENCI
// ---------------------------------------------------------------------------------------------------------------

router.get('/klient/:id', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}
    
    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM klienci WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('klient', { 
			title: 'Klient',
			klient: rows[0]
		});
	});

});

router.get('/klient/:id/edytuj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM klienci WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('klientEdit', { 
			title: 'Klient',
			klient: rows[0]
		});
	});

});

router.post('/klient/:id/edytuj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

    var id = parseInt(req.param('id'), 10);
    //req.body.tytul
    var zmiana = 'UPDATE klienci SET telefon='+req.body.telefon+' WHERE id='+id;
    connection.query(zmiana, function(err, result) {
		if (err) throw err;
		res.redirect('/klienci')
	});

});

router.post('/klient/:id/usun', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}
    
    var id = parseInt(req.param('id'), 10);
    //req.body.tytul
    var kasowanie = 'DELETE FROM klienci WHERE id='+id;
    connection.query(kasowanie, function(err, result) {
		if (err) throw err;
		res.redirect('/klienci')
	});

});

router.get('/dodaj/klienta', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var osoby = [];

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		
		for (var i = 0; i < rows.length; i++)
			osoby[i] = {
				id: rows[i].id,
				nazwa: rows[i].imie + ' ' + rows[i].nazwisko
			}
		console.log(osoby);

		res.render('klientAdd', {
			title: 'Nowy klient', 
			osoby: osoby
		});
	});
});

router.post('/klient/dodaj', function(req, res, next) {
	console.log('ID: '+req.body.nr_osoby)
	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	if (!req.body.nr_osoby || !req.body.telefon) {
		dialog.info('Żadne pole nie może być puste.', 'Wprowadź dane!', function(err) {});
	}
	else {
	    var dodawanie = 'INSERT INTO klienci (id_osoby, telefon) VALUES ('+req.body.nr_osoby+', '+req.body.telefon+')';
	    connection.query(dodawanie, function(err, result) {
			if (err) throw err;
			res.redirect('/klienci')
		});
	}

});

// ---------------------------------------------------------------------------------------------------------------
// 														WYPOZYCZENIA
// ---------------------------------------------------------------------------------------------------------------

router.get('/wypozyczenie/:id', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}
    
    var id = parseInt(req.param('id'), 10);
    
    connection.query('SELECT * FROM wypozyczenia WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		res.render('wypozyczenie', { 
			title: 'Wypozyczenie',
			wypozyczenie: rows[0]
		});
	});

});

router.post('/wypozyczenie/:id/usun', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}
    
    var id_wypozyczenia = parseInt(req.param('id'), 10);
    var id_ksiazki;
    var ilosc;
    //req.body.tytul
    connection.query('SELECT * FROM wypozyczenia WHERE id='+id_wypozyczenia, function(err, rows, fields) {
		if (err) throw err;

		id_ksiazki = rows[0].id_ksiazki;

	    connection.query('SELECT * FROM ksiazki WHERE id='+id_ksiazki, function(err, rows, fields) {
			if (err) throw err;
			ilosc = rows[0].ilosc;
			//console.log('Ilosc: '+ilosc)

			ilosc += 1;

			var zmiana = 'UPDATE ksiazki SET ilosc='+ilosc+' WHERE id='+id_ksiazki;
		    connection.query(zmiana, function(err, result) {
				if (err) throw err;	

			    var kasowanie = 'DELETE FROM wypozyczenia WHERE id='+id_wypozyczenia;
			    connection.query(kasowanie, function(err, result) {
					if (err) throw err;
					res.redirect('/wypozyczenia')
				});
			});
		});
	});
});

router.get('/dodaj/wypozyczenie', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var osoby = [];
	var ksiazki = [];
	var klienci = [];

	connection.query('SELECT * FROM osoby', function(err, rows4, fields) {
		if (err) throw err;
		for (var i = 0; i < rows4.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby[i] = {
				id: rows4[i].id,
				nazwa: rows4[i].imie + ' ' + rows4[i].nazwisko
			}
		}

		//console.log(osoby);

		connection.query('SELECT * FROM klienci', function(err, rows, fields) {
			if (err) throw err;
			for (var i = 0; i < rows.length; i++) {
				var id_osoby = parseInt(rows[i].id_osoby, 10);
				var osoba;
				for (var j = 0; j < osoby.length; j++)
					if (id_osoby == osoby[j].id)
						osoba = osoby[j];
				//console.log('Tytul: ' + result['tytul']);
				klienci[i] = {
					id: rows[i].id,
					nazwa: osoba.nazwa
				}

			}
			//console.log(klienci);

			connection.query('SELECT * FROM ksiazki', function(err, rows2, fields) {
				if (err) throw err;
				for (var i = 0; i < rows2.length; i++) {
					ksiazki[i] = {
						id: rows2[i].id,
						tytul: rows2[i].tytul,
						ilosc: rows2[i].ilosc
					}
				}

				res.render('wypozyczenieAdd', {
					title: 'Nowe wypożyczenie',
					klienci: klienci,
					ksiazki: ksiazki
				});
			});
		});

	});
});

router.post('/wypozyczenie/dodaj', function(req, res, next) {

	if (!loggedIn) {
		dialog.info('Zaloguj się aby uzyskać dostęp do tej części serwisu.', 'Błąd!', function(err) {});
		res.redirect('/login')
	}

	var ilosc;
	var id = req.body.nr_ksiazki;
	//console.log("ID: "+id);

	connection.query('SELECT * FROM ksiazki WHERE id='+id, function(err, rows, fields) {
		if (err) throw err;
		ilosc = rows[0].ilosc;
		//console.log('Ilosc: '+ilosc)
		if (ilosc > 0) {
			ilosc -= 1;
			var zmiana = 'UPDATE ksiazki SET ilosc='+ilosc+' WHERE id='+id;
		    connection.query(zmiana, function(err, result) {
				if (err) throw err;	

			    var dodawanie = 'INSERT INTO wypozyczenia (id_klienta, id_ksiazki) VALUES ('+req.body.nr_klienta+', '+req.body.nr_ksiazki+')';
			   // var dodawanie = 'INSERT INTO ksiazki (tytul, id_autora) VALUES (\'tarzan\', 2)';
			    connection.query(dodawanie, function(err, result) {
					if (err) throw err;
					res.redirect('/wypozyczenia')
				});
			});
		}
		else {
			dialog.info('Brak egzemplarzy tej książki do wypożyczenia.', 'Błąd!', function(err) {});
			res.redirect('/wypozyczenia')
		}
	});

});

// ---------------------------------------------------------------------------------------------------------------
// 														LOGOWANIE
// ---------------------------------------------------------------------------------------------------------------

router.get('/login', function(req, res, next) {

	connection.query('SELECT * FROM users', function(err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			userlist[i] = {
				username: rows[i].username,
				password: rows[i].password
			}
		}
		console.log(userlist);

		res.render('login', {title: 'Logowanie'});
	});
});

router.get('/logout', function(req, res, next) {

	connection.query('SELECT * FROM users', function(err, rows, fields) {
		
		loggedIn = false;

		res.redirect('/noauth');
	});
});

router.post('/login', function(req, res, next) {

	var username = req.body.login;
	var password = req.body.haslo;

	loggedIn = false;

	for (var i = 0; i < userlist.length; i++) {
		if (username == userlist[i].username)
			if (password == userlist[i].password)
				loggedIn = true;
	}
	if (loggedIn)
		res.redirect('/home');
	else {
		dialog.info('Logowanie nieudane, zła nazwa użytkownika lub hasło.', 'Błąd logowania!', function(err) {});
	}
});

router.get('/home', function(req, res, next) {

	res.render('home');
});

router.get('/noauth', function(req, res, next) {

	var ksiazki = [];
	var osoby = [];
	var osoba;

	connection.query('SELECT * FROM osoby', function(err, rows, fields) {
		if (err) throw err;
		for (var i = 0; i < rows.length; i++) {
			//console.log('Tytul: ' + result['tytul']);
			osoby[i] = {
				id: rows[i].id,
				nazwa: rows[i].imie + ' ' + rows[i].nazwisko
			}
		}
		connection.query('SELECT * FROM ksiazki', function(err, rows2, fields) {
			if (err) throw err;
			for (var i = 0; i < rows2.length; i++) {
				var id = parseInt(rows2[i].id_autora, 10);
				for (var j = 0; j < osoby.length; j++)
					if (id == osoby[j].id)
						osoba = osoby[j];
				//console.log('Tytul: ' + result['tytul']);
				ksiazki[i] = {
					id: rows2[i].id,
					autor: osoba.nazwa,
					tytul: rows2[i].tytul,
					ilosc: rows2[i].ilosc
				}
			}
			res.render('noAuth', { 
				title: 'Lista książek',
				ksiazki: ksiazki
			});
		});
	});
	
});

module.exports = router;

/*
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'test'
});

connection.connect();

connection.query('SELECT * FROM ksiazki', function(err, rows, fields) {
	if (err) throw err;
	for (var i = 0; i < rows.length; i++)
		console.log('Osoba: ', rows[i]);
});

connection.end();
*/

