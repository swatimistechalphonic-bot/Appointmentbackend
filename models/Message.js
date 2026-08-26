const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        senderName: {
            type: String,
            default: 'User'
        },
        receiverName: {
            type: String,
            default: 'Doctor'
        },
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
