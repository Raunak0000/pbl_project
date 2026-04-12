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
    public ResponseEntity<?> getAllBoards(@AuthenticationPrincipal User user) {
        // Collaborative: every authenticated user sees all boards
        return ResponseEntity.ok(boardRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Board> createBoard(@AuthenticationPrincipal User user,
            @RequestBody Board board) {
        // Track who created it, but all users can see/use it
        board.setUserId(user.getId());
        return ResponseEntity.ok(boardRepo.save(board));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(@AuthenticationPrincipal User user,
            @PathVariable String boardId) {
        Board board = boardRepo.findById(boardId).orElse(null);
        if (board == null) {
            return ResponseEntity.notFound().build();
        }

        // Allow deletion by the board creator OR any admin
        boolean isOwner = user.getId().equals(board.getUserId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403).body("Only the board creator or an admin can delete this board");
        }

        taskRepo.deleteByBoardId(boardId);
        boardRepo.deleteById(boardId);
        return ResponseEntity.ok().build();
    }
}
