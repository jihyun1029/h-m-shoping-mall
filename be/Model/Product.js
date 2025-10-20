const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const producetSchema = Schema(
    {
        sku: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        image: {type: String, required: true},
        category: {type: Array, required: true},
        description: {type: String, required: true},
        price: {type: Number, required: true},
        stock: {type: Object, required: true},
        status: {type: String, default: "active"},
        isDeleted: {type: Boolean, default: false},
    },{ timestamps: true }
);

producetSchema.methods.toJSON = function () {
    const obj = this._doc;
    delete obj.__v;
    delete obj.updatedAt;
    delete obj.createAt;
    return obj;
}

const Product = mongoose.model("Product", producetSchema)
module.exports = Product;
