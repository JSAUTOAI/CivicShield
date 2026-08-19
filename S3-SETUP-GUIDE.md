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
    "AllowedOrigins": [
      "http://localhost:3001",
      "https://civicshield.co.uk",
      "https://www.civicshield.co.uk"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**Both** civicshield.co.uk and **www**.civicshield.co.uk must be listed. The
site 307-redirects to the www host, so www is the origin the browser actually
sends — omit it and uploads fail in production with a CORS error while working
perfectly on localhost. The dev port is 3001, not 3000.

5. Click "Save changes"

---

## Step 4: Create an IAM User with S3 Access

1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click "Create user"
3. User name: `civicshield-s3`
4. Click "Next"
5. Select "Attach policies directly"
6. Click **"Create policy"**, choose the **JSON** tab, and paste the policy below.
   Name it `civicshield-evidence-access`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::civicshield-evidence/*"
    }
  ]
}
```

7. Back on the user screen, refresh the policy list, tick `civicshield-evidence-access`
8. Click "Next" then "Create user"

Do **not** use `AmazonS3FullAccess`. It grants access to every bucket in the
account, including ones you create later for anything else. If these keys ever
leak, the blast radius should be one bucket of evidence files, not everything.

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

## Step 7: Add the same four values to Vercel (do not skip)

`.env` is local only. Without this step uploads work on your machine and stay
broken for every real user.

1. Go to the CivicShield project on vercel.com -> **Settings** -> **Environment Variables**
2. Add all four (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`,
   `AWS_S3_BUCKET`) for **Production, Preview and Development**
3. Redeploy (Deployments -> latest -> Redeploy) — env vars are read at build time

---

## That's it!

Once the keys are in `.env` and in Vercel, uploads connect automatically —
no code change needed. Until then `/api/upload` returns a clear 503 and the
wizard tells the user their issue was still saved.

**Verify it worked:**
1. Create an issue with a file attached
2. The file row should show a progress bar, then "uploaded"
3. Confirm a row landed in the database:

```bash
node --env-file=.env -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.evidenceItem.count().then(n=>{console.log('evidence items:',n);return p.\$disconnect()})"
```

That count has been 0 across all 44 issues to date. Anything above 0 means it works.

Total time: ~15 minutes
Total cost: Effectively free (S3 free tier = 5GB storage + 20,000 GET requests/month)
