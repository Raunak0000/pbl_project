package com.syncpace.backend.controller;

import com.syncpace.backend.model.Board;
import com.syncpace.backend.model.User;
import com.syncpace.backend.repository.BoardRepo;
import com.syncpace.backend.repository.TaskRepo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
public class BoardController {
    private final BoardRepo boardRepo;
    private final TaskRepo taskRepo;

    public BoardController(BoardRepo boardRepo, TaskRepo taskRepo) {
        this.boardRepo = boardRepo;
        this.taskRepo = taskRepo;
    }

    @GetMapping
    public ResponseEntity<?> getAllBoards(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardRepo.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(@AuthenticationPrincipal User user,
            @RequestBody Board board) {
        // Set the owner to the authenticated user
        board.setUserId(user.getId());
        return ResponseEntity.ok(boardRepo.save(board));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(@AuthenticationPrincipal User user,
            @PathVariable String boardId) {
        // Verify the board belongs to the authenticated user before deleting
        Board board = boardRepo.findByIdAndUserId(boardId, user.getId())
                .orElse(null);
        if (board == null) {
            return ResponseEntity.status(403).body("Board not found or access denied");
        }
        taskRepo.deleteByBoardId(boardId);
        boardRepo.deleteById(boardId);
        return ResponseEntity.ok().build();
    }
}
