import { getCustomRepository, getRepository } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  importCSV: string;
}
interface Import {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ importCSV }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, importCSV);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const lines: Import[] = [];
    const transactions: Transaction[] = [];
    const parseCSV = readCSVStream.pipe(parseStream);
    parseCSV.on('data', async line => {
      const tempTransaction: Import = {
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      };
      const categoryRepository = getRepository(Category);
      const getCategory = await categoryRepository.findOne({
        where: { title: line[3] },
      });
      if (!getCategory) {
        const newCategory = categoryRepository.create({
          title: line[3],
        });
        await categoryRepository.save(newCategory);
        tempTransaction.category = newCategory.id;
      } else {
        tempTransaction.category = getCategory.id;
      }
      lines.push(tempTransaction);
    });
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    const transactionRepository = getCustomRepository(TransactionRepository);
    const tempTransacions = await transactionRepository.create(lines);

    await transactionRepository.save(tempTransacions);
    console.log(tempTransacions);
    return tempTransacions;
    // lines.forEach(async transaction => {
    //   const createTransaction = new CreateTransactionService();
    //   const tempRegistry: Import = {
    //     title: transaction.title,
    //     type: transaction.type,
    //     value: transaction.value,
    //     category_id: transaction.category_id,
    //   };
    //   const temptransaction = await createTransaction.execute(tempRegistry);
    //   transactions.push(temptransaction);
    // });
    return transactions;
  }
}

export default ImportTransactionsService;
