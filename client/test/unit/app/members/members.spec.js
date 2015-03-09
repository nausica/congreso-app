//jasmine template here
describe('member controllers', function() {

	function runController($scope, members) {
		inject(function($controller) {
			$controller('MembersViewCtrl', { $scope: $scope, members: members });
		});
	}

	function createMockMember(id) {
		return {
			$id: function() { return id; }
		};
	}

	function createMockMembersList(id) {
		return [ createMockMember('54bd4a065a1af74e4227b560') ];
	}

	/*
	function createMockMembersList() {
		return {
			members: [{ "group" : "G.P. Popular ( GP )" , "location" : "Granada" , "name" : "Castillo Calvín, José Miguel" , "picture_url" : "http://www.congreso.es/wc/htdocs/web/img/diputados/256_10.jpg" , "_id" : { "$oid" : "53b45f75e08976c206f3433c"} , "committee_list" : [ { "name" : "Comisión de Justicia" , "role" : "Portavozde la Comisión de Justicia" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=303" , "_id" : { "$oid" : "53b45f75e08976c206f34342"}} , { "name" : "Comisión de Sanidad y Servicios Sociales" , "role" : "Vocalde la Comisión de Sanidad y Servicios Sociales" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=325" , "_id" : { "$oid" : "53b45f75e08976c206f34341"}} , { "name" : "Comisión de Cultura" , "role" : "Adscritode la Comisión de Cultura" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=330" , "_id" : { "$oid" : "53b45f75e08976c206f34340"}} , { "name" : "Comisión de Reglamento" , "role" : "Vocalde la Comisión de Reglamento" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=312" , "_id" : { "$oid" : "53b45f75e08976c206f3433f"}} , { "name" : "Comisión Mixta para la Unión Europea" , "role" : "Vocalde la Comisión Mixta para la Unión Europea" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=318" , "_id" : { "$oid" : "53b45f75e08976c206f3433e"}} , { "name" : "Ponencia P.L. Org. complemen. Ley racionaliz. sector público(121/93)" , "role" : "Ponentede la Ponencia PL Org complemen Ley racionaliz sector público(121/93)" , "url" : "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/composicionOrgano&idOrgano=303112" , "_id" : { "$oid" : "53b45f75e08976c206f3433d"}}] , "personal_list" : [ "Diputado por                                         Granada.                                                                                                    G.P. Popular ( GP )" , "Nacido el                                                 27 de julio de 1966                                                ." , "Diputado de la                                                                                                                                 X                                                                                                                            legislatura." , "Casado. Dos hijos.   Abogado y Economista.   Licenciado en Derecho por la universidad de Granada, 1989.Licenciado en Administración y Dirección de Empresas por la Universidad Antonio de Nebrija (Madrid) 2010.   Cursos de Doctorado.Publicaciones, libros y conferenciante habitual en la especialidad de Derecho Sanitario, bioética y responsabilidad de la Administración." , "" , "" , "Fecha alta: 02/12/2011."] , "__v" : 0}]
		};
	}
	*/

	beforeEach(module('members'));

	describe('MembersViewCtrl', function () {

		it("attaches the list of members to the scope", function() {
			var $scope = {},
				members = createMockMembersList();

			runController($scope, members);
			expect($scope.members).toBe(members);
		});
	});

	describe('viewMember(54bd4a065a1af74e4227b560)', function() {
		var $scope = {},
			members = createMockMembersList();

		it('changes the location', inject(function($location) {
			spyOn($location, 'path');
			runController($scope, members);

			console.log(members[0]);

			$scope.viewMember(members[0]);

			expect($location.path).toHaveBeenCalledWith('/members/54bd4a065a1af74e4227b560');

		}));
	});
});