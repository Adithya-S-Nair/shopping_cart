var db = require('../config/connection')
var collection = require('../config/collections')
const collections = require('../config/collections')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
module.exports = {
    addproduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data.insertedId)
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).remove({ _id: objectId(proId) }).then((response) => {
                resolve(response)

            })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: proDetails.Name,
                        Description: proDetails.Description,
                        Category: proDetails.Category
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    getAllPlacedOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orderList = await db.get().collection(collection.ORDER_COLLECTION).find({ status: 'placed' }).toArray()
            resolve(orderList)
        })
    },
    shipProduct: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'Shipped'
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    },
}