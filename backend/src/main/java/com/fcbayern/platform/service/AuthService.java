package com.fcbayern.platform.service;

import com.fcbayern.platform.dto.AuthResponse;
import com.fcbayern.platform.dto.LoginRequest;
import com.fcbayern.platform.dto.RegisterRequest;
import com.fcbayern.platform.entity.User;
import com.fcbayern.platform.exception.BadRequestException;
import com.fcbayern.platform.repository.UserRepository;
import com.fcbayern.platform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.expiration-ms}")
    private Long expirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .active(true)
                .build();
        user = userRepository.save(user);
        String accessToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String newAccessToken = jwtTokenProvider.generateTokenFromEmail(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .expiresIn(expirationMs)
                .build();
    }
}
