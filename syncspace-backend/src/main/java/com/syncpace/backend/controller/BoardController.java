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
public class BoardController {
    private final BoardRepo boardRepo;
    private final com.syncpace.backend.repository.TaskRepo taskRepo;

    // Standard Constructor Injection (Spring automatically knows to inject here)
    public BoardController(BoardRepo boardRepo, com.syncpace.backend.repository.TaskRepo taskRepo) {
        this.boardRepo = boardRepo;
        this.taskRepo = taskRepo;
    }

    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody Board board) {
        return ResponseEntity.ok(boardRepo.save(board));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String boardId) {
        taskRepo.deleteByBoardId(boardId);
        boardRepo.deleteById(boardId);
        return ResponseEntity.ok().build();
    }
}
