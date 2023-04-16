// Routing file: pages of website

const express = require('express')
const router = express.Router()
const path = require('path')

router.get('/', (req, res) =>{
    res.send('')
    console.log('hi')
})

module.exports = router