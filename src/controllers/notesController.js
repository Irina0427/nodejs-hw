import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search = '' } = req.query;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;

  
    const filter = {};

    if (tag) {
      filter.tag = tag;
    }

    const trimmedSearch = typeof search === 'string' ? search.trim() : '';
    if (trimmedSearch) {
 
      filter.$text = { $search: trimmedSearch };
    }

    const skip = (pageNum - 1) * perPageNum;


    const totalNotes = await Note.countDocuments(filter);
    const totalPages = totalNotes === 0 ? 0 : Math.ceil(totalNotes / perPageNum);

  
    const notesQuery = Note.find(filter).skip(skip).limit(perPageNum);

    if (filter.$text) {
      notesQuery
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else {
    
      notesQuery.sort({ createdAt: -1 });
    }

    const notes = await notesQuery;

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);

    if (!note) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const created = await Note.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const updated = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const deleted = await Note.findByIdAndDelete(noteId);

    if (!deleted) {
      throw createHttpError(404, 'Note not found');
    }

    res.status(200).json(deleted);
  } catch (err) {
    next(err);
  }
};
