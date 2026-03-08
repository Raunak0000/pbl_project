package com.syncpace.backend.controller;

import com.syncpace.backend.model.Board;
import com.syncpace.backend.repository.BoardRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
@CrossOrigin(origins = "*")
public class BoardController {
    private final BoardRepo boardRepo;

    // Standard Constructor Injection (Spring automatically knows to inject here)
    public BoardController(BoardRepo boardRepo) {
        this.boardRepo = boardRepo;
    }

    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody Board board) {
        return ResponseEntity.ok(boardRepo.save(board));
    }
}
