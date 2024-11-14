import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: true }); // Update: use formidable() directly without "new"

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }

      console.log('Fields:', fields);
      console.log('Files:', files);

      res.status(200).json({ fields, files });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
