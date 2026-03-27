# AWS S3 Setup Guide for CivicShield

Follow these steps to get your S3 credentials. Once done, paste the values into your .env file.

---

## Step 1: Create an AWS Account (skip if you already have one)

Go to: https://aws.amazon.com/free/
- Click "Create a Free Account"
- Follow the signup process (you'll need a credit card but S3 is effectively free for our usage)
- S3 costs: ~£0.02 per GB stored per month. You won't spend more than a few pence.

---

## Step 2: Create an S3 Bucket

1. Go to: https://s3.console.aws.amazon.com/s3/buckets
2. Click "Create bucket"
3. Bucket name: `civicshield-evidence`
4. AWS Region: **EU (London) eu-west-2** (keeps data in the UK for GDPR)
5. Leave "Block all public access" CHECKED (we use presigned URLs, not public access)
6. Leave everything else as default
7. Click "Create bucket"

---

## Step 3: Set up CORS on the bucket

1. Click on your new `civicshield-evidence` bucket
2. Go to the "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://civicshield.co.uk"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Click "Save changes"

---

## Step 4: Create an IAM User with S3 Access

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click "Create user"
3. User name: `civicshield-s3`
4. Click "Next"
5. Select "Attach policies directly"
6. Search for `AmazonS3FullAccess` and tick the checkbox
7. Click "Next" then "Create user"

---

## Step 5: Create Access Keys

1. Click on the user you just created (`civicshield-s3`)
2. Go to the "Security credentials" tab
3. Scroll down to "Access keys"
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Next" then "Create access key"
7. You'll see two values:
   - **Access key ID** (starts with `AKIA...`)
   - **Secret access key** (a long string)

IMPORTANT: Copy both now. The secret key is only shown once.

---

## Step 6: Paste into .env

Open your .env file and add these lines (I've already added the placeholders):

```
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-key-here"
AWS_REGION="eu-west-2"
AWS_S3_BUCKET="civicshield-evidence"
```

---

## That's it!

Once you've pasted the keys into .env, let me know and the file upload system will be connected.

Total time: ~10 minutes
Total cost: Effectively free (S3 free tier = 5GB storage + 20,000 GET requests/month)
