/* global angular */

(function () {

	'use strict';

	angular.module('votings', [
		'resources.votings', 
		'resources.votes', 
		'ui.bootstrap', 
		'ngRoute'])

	.controller('VotingDetailCtrl', ['$scope', '$location', '$routeParams', 'votings', 'votes', function ($scope, $location, $routeParams, votings, votes) {
		console.log('dlsjdlsfj')
  		
	}])
}());
