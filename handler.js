'use strict'
const AWS = require('aws-sdk')
const _ = require('lodash')

const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'})

module.exports.getAverageRating = (event, context, callback) => {
  const institution = event.pathParameters.institution
  const courseId = event.pathParameters.courseId
  const stage = event.stage || 'dev'
  const id = `${institution}::${courseId}`

  const params = {
    TableName: `${stage}-courseRatingTable`,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id
    }
  }

  docClient.query(params, function(err, data) {
    if (err) {
      callback(err)
    }
    else {
      const count = data.Count
      const total = _.reduce(data.Items, (memo, item) => { return memo + item.rating }, 0)
      const averageRating = total / count

      callback(null, {
        statusCode: 200,
        body: JSON.stringify({ count, total, averageRating }),
        headers: {
          "Access-Control-Allow-Origin" : "*"
        }
      })
    }
  })
}

module.exports.putRating = (event, context, callback) => {
  const institution = event.pathParameters.institution
  const courseId = event.pathParameters.courseId
  const rating = JSON.parse(event.body)
  const stage = event.stage || 'dev'
  const id = `${institution}::${courseId}`

  const params = {
    TableName: `${stage}-courseRatingTable`,
    Item: Object.assign({ id, courseId, institution }, rating)
  }

  docClient.put(params, (err, data) => {
    if(err) {
      callback(err)
    }
    else {
      callback(null, {
        statusCode: 200,
        body: '{\"message\": \"ok\"}',
        headers: {
          "Access-Control-Allow-Origin" : "*"
        }
      })
    }
  })
}