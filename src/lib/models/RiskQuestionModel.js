
import mongoose from 'mongoose'


const RiskQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answers: [{
        text: {
            type: String,
            required: true
        },
        marks: {
            type: Number,
            required: true
        }
    }],
    status:{
  type: Boolean,
  default: false,
}
},
    {
        timestamps: true
    })

const RiskQuestionModel = mongoose.models.riskquestions || mongoose.model('riskquestions', RiskQuestionSchema);

export default RiskQuestionModel;