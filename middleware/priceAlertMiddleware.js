const PriceAlert = require("../models/priceAlertModel");
const axios = require("axios");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const {pushNotification} = require('../middleware/pushNotificationMiddleware')


const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')

const scheduler = new ToadScheduler()

const task = new Task('simple task', () => { counter++ })
const job = new SimpleIntervalJob({ seconds: 20, }, task)

scheduler.addSimpleIntervalJob(job)

// when stopping your app
scheduler.stop()