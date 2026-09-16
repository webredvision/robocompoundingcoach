import mongoose from 'mongoose';

const RoboSchema = new mongoose.Schema(
  {
    // 🧠 Key fields to distinguish user types
    softwareUser: {
      type: Boolean,
      default: true, // always true for robo users too
    },
    roboUser: {
      type: Boolean,
      default: false, // this model represents users who also have Robo
    },
    arnId: {
            type: String,
    },
    arnNumber: {
      type: String,
    },
    deskType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const RoboModel =
  mongoose.models.robopermission || mongoose.model('robopermission', RoboSchema);

export default RoboModel;
