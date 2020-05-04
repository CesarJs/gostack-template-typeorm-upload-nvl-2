import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  console.log(balance.total);
  if (type === 'outcome' && value > balance.total) {
    return response.status(400).json({
      message:
        'should not be able to create outcome transaction without a valid balance',
      status: 'error',
    });
  }

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransacion = new DeleteTransactionService();
  await deleteTransacion.execute({ id });
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importCSV = new ImportTransactionsService();
    const transactions = await importCSV.execute({
      importCSV: request.file.filename,
    });
    return response.json(transactions);
  },
);

export default transactionsRouter;
