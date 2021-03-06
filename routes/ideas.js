const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const {ensureAuthenticated} = require('../helper/auth');


//Load model
require('../models/ideas');
const Idea = mongoose.model('ideas');

//Add idea
route.get('/add',ensureAuthenticated,(req,res) =>{
	res.render('ideas/add')
});

//Edit Idea Form routed when edit button is clicked from list of ideas page
route.get('/edit/:id',ensureAuthenticated,(req,res) =>{
	Idea.findOne({
		_id:req.params.id
	})
	.then(idea => {
		if(idea.user != req.user.id){
			req.flash('error_msg','Not Authorised');
			res.redirect('/ideas');
		}
		else
		{
			res.render('ideas/edit',{
				idea:idea
			});	
		}
		

	});
});

// Process Form to add data to db when submit button is clicked in add idea page
route.post('/',ensureAuthenticated,(req,res)=>{
	let errors = [];

	if(!req.body.title)
	{
		errors.push({text:'Please add a title'});
	}
	if(!req.body.details)
	{
		errors.push({text:'Please add some details'});
	}

	if(errors.length > 0)
	{
		res.render('ideas/add',{
			errors:errors,
			title: req.body.title,
			details: req.body.details
		});
	} 
	else
	{
		const newIdea ={
			title: req.body.title,
			details: req.body.details,
			user: req.user.user_id
		}
		new Idea(newIdea)
		.save()
		.then(idea => {
			req.flash('success_msg','Video idea added');
			res.redirect('./ideas');
		})
	}
});

//to display the list of all ideas  
route.get('/',ensureAuthenticated,(req,res)=>{
	Idea.find({user:req.user.id})
	.sort({date:'desc'})
	.then(ideas =>{
		res.render('ideas/index',{
			ideas:ideas
		});
	});
});

route.put('/:id',ensureAuthenticated,(req,res)=>{
	Idea.findOne({
		_id: req.params.id
	})
	.then(idea => {
		idea.title = req.body.title;
		idea.details = req.body.details;

		idea.save()
		.then(idea => {
			req.flash('success_msg','Video idea updated');
			res.redirect('/ideas');
		})
	})
});	

route.delete('/:id',ensureAuthenticated,(req,res)=>{
	Idea.remove({
		_id: req.params.id
	})
	.then(()=>{
		req.flash('success_msg','Video idea removed');
		res.redirect('/ideas');
	})
	.catch((err)=>{
		console.log(err)
	});
});

module.exports = route;