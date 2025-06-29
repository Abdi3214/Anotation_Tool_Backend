const mongoose = require('mongoose')

const annotationSchema = mongoose.Schema(
  {
    Annotator_ID: { type: Number, required: true }, 
    Annotator_Email: { type: String, required: true },
    Annotation_ID: { type: String, unique: true},
    Comment: { type: String,  },
    Src_Text: { type: String, required: true },
    Target_Text: { type: String, required: true },
    Score: { type: Number, required: true },
    Omission: { type: Number, default: 0  },
    Addition: { type: Number, default: 0  },
    Mistranslation: { type: Number, default: 0  },
    Untranslation: { type: Number, default: 0  },
    Src_Issue: { type: String, required: true },
    Target_Issue: { type: String, required: true },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  
  { timestamps: true, versionKey: false }, // This removes __v
)
annotationSchema.pre('save', async function (next) {
  if (!this.Annotation_ID) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(100000 + Math.random() * 900000).toString();
      // Check against Annotation model, not User
      const existing = await mongoose.models.Annotation.findOne({ Annotation_ID: randomId });
      if (!existing) {
        this.Annotation_ID = randomId;
        isUnique = true;
      }
    }
  }
  next();
});

const annotation = mongoose.model('Annotation', annotationSchema)

module.exports = annotation