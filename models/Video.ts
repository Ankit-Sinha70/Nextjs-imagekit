import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    controls: {
      type: Boolean,
      default: true,
    },
    transformation: {
      height: {
        type: Number,
        default: VIDEO_DIMENSIONS.height,
      },
      width: {
        type: Number,
        default: VIDEO_DIMENSIONS.width,
      },
      quality: {
        type: Number,
        min: 1,
        max: 100,
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Video: Model<IVideo> = models.Video || model<IVideo>("Video", videoSchema);

export default Video;
