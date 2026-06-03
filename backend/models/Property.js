import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a monthly rental price'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location (city/state)'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify property type'],
      enum: ['house', 'apartment', 'studio', 'room'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please add number of bedrooms'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please add number of bathrooms'],
    },
    size: {
      type: Number,
      required: [true, 'Please add size in square feet'],
    },
    images: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model('Property', propertySchema);

export default Property;
